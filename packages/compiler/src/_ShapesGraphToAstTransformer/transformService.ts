import dataFactory from "@rdfx/data-factory";
import { Curie } from "@rdfx/iri";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { parse as parseUriTemplate } from "uri-template";
import * as ast from "../ast/index.js";
import { Eithers } from "../Eithers.js";
import type * as input from "../input/index.js";
import type { OperationHttpBinding } from "../input/input.shaclmate.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import { ShapeStack } from "./ShapeStack.js";
import { transformPropertyShapeToAstStructTypeField } from "./transformPropertyShapeToAstStructTypeField.js";
import { transformShapeToAstType } from "./transformShapeToAstType.js";

function astConstructName(
  this: ShapesGraphToAstTransformer,
  object: input.Operation | input.Service,
): Either<Error, string> {
  // Explicit shaclmate:name
  if (object.name.isJust()) {
    return Either.of(object.name.unsafeCoerce());
  }

  const objectIdentifier = object.$identifier();

  // CURIE identifier
  if (objectIdentifier instanceof Curie) {
    if (
      this.shapesGraph.uniqueCurieReferences.has(objectIdentifier.reference)
    ) {
      return Either.of(objectIdentifier.reference);
    }

    return Either.of(
      `${objectIdentifier.prefix}_${objectIdentifier.reference}`,
    );
  }

  return Left(
    new Error(
      `${objectIdentifier} has a non-CURIE identifier (${objectIdentifier}) and no shaclmate:name`,
    ),
  );
}

function parseUrlTemplate(
  input: string,
): Either<Error, ReturnType<typeof parseUriTemplate>["ast"]> {
  return Either.encase(() => parseUriTemplate(input).ast);
}

function transformOperation(
  this: ShapesGraphToAstTransformer,
  {
    inputOperation,
    inputServiceName,
  }: {
    inputOperation: input.Operation;
    inputServiceName: string;
  },
): Either<Error, ast.Operation> {
  return astConstructName
    .call(this, inputOperation)
    .chain((inputOperationName) => {
      const httpBindingUriTemplate =
        inputOperation.httpBinding.extract()?.urlTemplate ??
        `/${inputServiceName}/${inputOperationName}`;
      return parseUrlTemplate(httpBindingUriTemplate).chain(
        (parsedHttpBindingUriTemplate) => {
          function transformHttpBinding({
            astInput,
            astOutput,
          }: {
            astInput: Maybe<ast.Operation.Input>;
            astOutput: Maybe<ast.Operation.Output>;
          }): Either<Error, ast.Operation.HttpBinding> {
            const inputHttpBinding: OperationHttpBinding | undefined =
              inputOperation.httpBinding.extract();

            let method = inputHttpBinding?.method.extract();
            if (method === undefined) {
              astInput.ifJust((astInput) => {
                if (
                  astInput.httpBinding.propertySourcesByPropertyName
                    .values()
                    .some((value) => value === "body")
                ) {
                  method = "POST";
                }
              });
              if (!method) {
                method = "GET";
              }
            }

            let statusCode: ast.Operation.HttpBinding["statusCode"] | undefined;
            if (statusCode === undefined) {
              statusCode = astOutput.isJust() ? 200 : 204;
            }

            return Either.of({
              method,
              statusCode,
              uriTemplate: parsedHttpBindingUriTemplate,
            });
          }

          return Eithers.chain3(
            transformOperationErrors.call(this, { inputOperation }),
            transformOperationInput.call(this, {
              astOperationHttpBinding: {
                uriTemplate: parsedHttpBindingUriTemplate,
              },
              inputOperation,
            }),
            transformOperationOutput.call(this, { inputOperation }),
          ).chain(([astErrors, astInput, astOutput]) => {
            return transformHttpBinding({ astInput, astOutput }).map(
              (httpBinding) =>
                new ast.Operation({
                  comment: inputOperation.comment,
                  errors: astErrors,
                  httpBinding,
                  label: inputOperation.label,
                  name: inputOperationName,
                  input: astInput,
                  output: astOutput,
                }),
            );
          });
        },
      );
    });
}

function transformOperationErrors(
  this: ShapesGraphToAstTransformer,
  { inputOperation }: { inputOperation: input.Operation },
): Either<Error, readonly ast.Operation.Error[]> {
  return Either.sequence(
    inputOperation.errors.map((inputError) =>
      transformShapeToAstType
        .call(this, inputError, new ShapeStack())
        .chain((astErrorType) => {
          if (astErrorType.kind !== "Struct") {
            return Left(
              new Error(
                `expected ${inputError} to be a struct or discriminated union of structs`,
              ),
            );
          }

          const inputHttpBinding = inputError.httpBinding.extract();

          return Either.of<Error, ast.Operation.Error>({
            httpBinding: {
              contentType: "application/problem+json",
              statusCode: inputHttpBinding?.statusCode ?? 500,
            },
            type: astErrorType,
          });
        }),
    ),
  );
}

function transformOperationInput(
  this: ShapesGraphToAstTransformer,
  {
    astOperationHttpBinding,
    inputOperation,
  }: {
    astOperationHttpBinding: Pick<ast.Operation.HttpBinding, "uriTemplate">;
    inputOperation: input.Operation;
  },
): Either<Error, Maybe<ast.Operation.Input>> {
  const inputInput = inputOperation.input.extract();
  if (!inputInput) {
    return Either.of(Maybe.empty());
  }

  const logger = this.logger;

  return transformShapeToAstType
    .call(this, inputInput, new ShapeStack())
    .chain((astInputType) => {
      if (astInputType.kind !== "Struct") {
        return Left(
          new Error(
            `expected ${inputOperation} input ${inputInput} to be a struct`,
          ),
        );
      }

      function transformHttpBinding(): Either<
        Error,
        ast.Operation.Input.HttpBinding
      > {
        const propertyNames = new Set(
          (astInputType as ast.StructType).fields
            .filter((field) => field.kind === "Shacl")
            .map((field) => field.name),
        );
        const propertySourcesByPropertyName = new Map<
          string,
          ast.Operation.Input.HttpBinding.PropertySource
        >();

        for (const part of astOperationHttpBinding.uriTemplate.parts) {
          if (part.type === "literal") {
            continue;
          }
          const parameterSource =
            part.operator === "?" || part.operator === "&" ? "query" : "path";
          for (const variable of part.variables) {
            if (!propertyNames.has(variable.name)) {
              throw new Error(
                `${inputOperation.$identifier()} HTTP binding URI template references variable ${variable.name} that is not in parameter`,
              );
            }

            const existingParameterSource = propertySourcesByPropertyName.get(
              variable.name,
            );
            if (existingParameterSource == null) {
              propertySourcesByPropertyName.set(variable.name, parameterSource);
            } else if (existingParameterSource !== parameterSource) {
              logger.warn(
                "%s HTTP binding URI template has parameter %s with multiple sources (%s and %s)",
                inputOperation.$identifier(),
                variable.name,
                existingParameterSource,
                parameterSource,
              );
            }
          }
        }

        let bodyParametersCount = 0;
        for (const parameterName of propertyNames) {
          if (!propertySourcesByPropertyName.has(parameterName)) {
            propertySourcesByPropertyName.set(parameterName, "body");
            bodyParametersCount++;
          }
        }

        // let method = inputRequest.method.extract();
        // if (!method) {
        //   if (bodyParametersCount > 0) {
        //     method = "POST";
        //   } else {
        //     method = "GET";
        //   }
        // }

        let contentType = inputInput?.httpBinding
          .extract()
          ?.contentType.extract();
        if (!contentType) {
          if (bodyParametersCount > 0) {
            contentType = "application/json";
          }
        }

        return Either.of({
          contentType: Maybe.fromNullable(contentType),
          propertySourcesByPropertyName,
        } satisfies ast.Operation.Input.HttpBinding);
      }

      if (!astInputType.extern && astInputType.identifierField.isJust()) {
        // If the struct type has an identifier property, mint a new, anonymous struct type with the other properties
        const fields = astInputType.fields;
        astInputType = new ast.StructType({
          comment: astInputType.comment,
          extern: false,
          fromRdfType: Maybe.empty(),
          identifierType: new ast.BlankNodeType({
            comment: Maybe.empty(),
            label: Maybe.empty(),
            name: Maybe.empty(),
            shapeIdentifier: astInputType.identifierType.shapeIdentifier,
          }),
          label: astInputType.label,
          name: Maybe.empty(),
          shapeIdentifier: astInputType.shapeIdentifier,
          synthetic: false,
          toRdfTypes: [],
          tsImports: [],
        });
        for (const field of fields) {
          if (field.kind === "Identifier") {
            continue;
          }
          invariant(field.kind === "Shacl");
          astInputType.addField(
            new ast.StructType.ShaclField({
              ...field,
              structType: astInputType,
            }),
          );
        }
      }

      return transformHttpBinding().map((httpBinding) =>
        Maybe.of({
          httpBinding,
          type: astInputType,
        }),
      );
    });
}

function transformOperationOutput(
  this: ShapesGraphToAstTransformer,
  { inputOperation }: { inputOperation: input.Operation },
): Either<Error, Maybe<ast.Operation.Output>> {
  const inputOutput = inputOperation.output.extract();
  if (!inputOutput) {
    return Either.of(Maybe.empty());
  }
  return transformPropertyShapeToAstStructTypeField
    .call(this, {
      propertyShape: inputOutput,
      structType: new ast.StructType({
        comment: Maybe.empty(),
        extern: false,
        fromRdfType: Maybe.empty(),
        identifierType: new ast.IdentifierType({
          comment: Maybe.empty(),
          label: Maybe.empty(),
          name: Maybe.empty(),
          shapeIdentifier: dataFactory.blankNode(),
        }),
        label: Maybe.empty(),
        name: inputOperation.name,
        shapeIdentifier: inputOperation.$identifier(),
        synthetic: true,
        toRdfTypes: [],
        tsImports: [],
      }),
    })
    .chain((astOutputTypeMaybe) => {
      const astOutputType = astOutputTypeMaybe.unsafeCoerce().type;
      let httpBindingContentType = inputOutput.httpBinding
        .extract()
        ?.contentType.extract();

      switch (astOutputType.kind) {
        case "Struct":
          if (httpBindingContentType === undefined) {
            httpBindingContentType = "application/json";
          }
          break;
        case "Option":
          if (astOutputType.itemType.kind === "Struct") {
            if (httpBindingContentType === undefined) {
              httpBindingContentType = "application/json";
            }
            break;
          } else {
            return Left(
              new Error(
                `expected ${inputOperation} result ${inputOutput} to be a struct or optional struct`,
              ),
            );
          }
        default:
          return Left(
            new Error(
              `expected ${inputOperation} result ${inputOutput} to be a struct or optional struct`,
            ),
          );
      }

      return Either.of(
        Maybe.of({
          httpBinding: { contentType: httpBindingContentType },
          type: astOutputType as
            | ast.StructType
            | ast.OptionType<ast.StructType>,
        }),
      );
    });
}

export function transformService(
  this: ShapesGraphToAstTransformer,
  inputService: input.Service,
): Either<Error, ast.Service> {
  return astConstructName.call(this, inputService).chain((inputServiceName) => {
    const astOperations: ast.Operation[] = [];
    for (const inputOperation of inputService.operations) {
      const astOperationEither = transformOperation.call(this, {
        inputOperation,
        inputServiceName,
      });
      if (astOperationEither.isLeft()) {
        return astOperationEither;
      }
      astOperations.push(astOperationEither.extract() as ast.Operation);
    }
    if (astOperations.length === 0) {
      return Left(
        new Error(`service ${inputService.$identifier()} has no operations`),
      );
    }

    return Either.of(
      new ast.Service({
        comment: inputService.comment,
        label: inputService.label,
        name: inputServiceName,
        operations: astOperations,
      }),
    );
  });
}
