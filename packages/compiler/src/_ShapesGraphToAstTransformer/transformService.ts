import { Curie } from "@shaclmate/shacl-ast";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { parse as parseUriTemplate } from "uri-template";
import * as ast from "../ast/index.js";
import { Eithers } from "../Eithers.js";
import type * as input from "../input/index.js";
import type { OperationHttpBinding } from "../input/input.shaclmate.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import { ShapeStack } from "./ShapeStack.js";
import { transformShapeToAstType } from "./transformShapeToAstType.js";

function astConstructName(
  object: input.Operation | input.Service,
): Either<Error, string> {
  // Explicit shaclmate:name
  if (object.name.isJust()) {
    return Either.of(object.name.unsafeCoerce());
  }

  const objectIdentifier = object.$identifier();

  // CURIE identifier
  if (objectIdentifier instanceof Curie) {
    if (objectIdentifier.hasUniqueReference) {
      return Either.of(objectIdentifier.reference);
    }

    return Either.of(
      `${objectIdentifier.prefix}_${objectIdentifier.reference}`,
    );
  }

  return Left(
    new Error(
      `${object.$type} ${objectIdentifier} has a non-CURIE identifier (${objectIdentifier}) and no shaclmate:name`,
    ),
  );
}

function transformOperation(
  this: ShapesGraphToAstTransformer,
  inputOperation: input.Operation,
): Either<Error, ast.Operation> {
  const self = this;
  const logger = this.logger;

  function transformError(): Either<
    Error,
    Maybe<ast.StructType | ast.StructDiscriminatedUnionType>
  > {
    const inputError = inputOperation.error.extract();
    if (!inputError) {
      return Either.of(Maybe.empty());
    }
    return transformShapeToAstType
      .call(self, inputError, new ShapeStack())
      .chain((astParameter) => {
        if (
          (astParameter.kind === "DiscriminatedUnion" &&
            astParameter.isStructDiscriminatedUnionType()) ||
          astParameter.kind === "Struct"
        ) {
          return Either.of<
            Error,
            ast.StructType | ast.StructDiscriminatedUnionType
          >(astParameter);
        }
        return Left(
          new Error(
            `expected ${inputError} to be a struct or discriminated union of structs`,
          ),
        );
      })
      .map(Maybe.of);
  }

  function transformHttpBinding(
    inputHttpBinding: OperationHttpBinding,
    astParameter: Maybe<ast.Operation.Parameter>,
    astResult: Maybe<ast.Operation.Result>,
  ): Either<Error, ast.Operation.HttpBinding> {
    function transformRequest(): Either<
      Error,
      ast.Operation.HttpBinding.Request
    > {
      return Either.encase(() => {
        const inputRequest = inputHttpBinding.request;
        const parsedUrlTemplate = parseUriTemplate(inputRequest.urlTemplate);

        const parameterNames = new Set(
          astParameter
            .map((astParameter) =>
              astParameter.fields
                .filter((field) => field.kind === "Shacl")
                .map((field) => field.name),
            )
            .orDefault([]),
        );
        const parameterSources = new Map<string, "query" | "path">();

        for (const part of parsedUrlTemplate.ast.parts) {
          if (part.type === "literal") {
            continue;
          }
          const parameterSource =
            part.operator === "?" || part.operator === "&" ? "query" : "path";
          for (const variable of part.variables) {
            if (!parameterNames.has(variable.name)) {
              throw new Error(
                `${inputOperation.$identifier()} HTTP binding URI template references variable ${variable.name} that is not in parameter`,
              );
            }

            const existingParameterSource = parameterSources.get(variable.name);
            if (existingParameterSource == null) {
              parameterSources.set(variable.name, parameterSource);
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

        let method = inputRequest.method.extract();
        if (!method) {
          if (parameterSources.size < parameterNames.size) {
            // There are unaccounted-for parameters - must be in the body.
            method = "POST";
          } else {
            method = "GET";
          }
        }

        let contentType = inputRequest.contentType.extract();
        if (!contentType) {
          if (parameterSources.size < parameterNames.size) {
            // There are unaccounted-for parameters - put them in a JSON body.
            contentType = "application/json";
          }
        }

        return {
          contentType: Maybe.fromNullable(contentType),
          method,
          uriTemplate: parsedUrlTemplate,
        } satisfies ast.Operation.HttpBinding.Request;
      });
    }

    function transformResponse(
      _astRequest: ast.Operation.HttpBinding.Request,
    ): Either<Error, ast.Operation.HttpBinding.Response> {
      const inputResponse = inputHttpBinding.response.extract();

      let contentType = inputResponse?.contentType.extract();
      const astResult_ = astResult.extract();
      if (astResult_) {
        contentType = "application/json";
      }

      let statusCode = inputResponse?.statusCode.extract();
      if (!statusCode) {
        if (contentType) {
          statusCode = 200;
        } else {
          statusCode = 204;
        }
      }

      return Either.of({
        contentType: Maybe.fromNullable(contentType),
        statusCode,
      });
    }

    return transformRequest().chain((request) =>
      transformResponse(request).map((response) => ({
        request,
        response,
      })),
    );
  }

  function transformParameter(): Either<Error, Maybe<ast.Operation.Parameter>> {
    const inputParameter = inputOperation.parameter.extract();
    if (!inputParameter) {
      return Either.of(Maybe.empty());
    }
    return transformShapeToAstType
      .call(self, inputParameter, new ShapeStack())
      .chain((astParameter) => {
        if (astParameter.kind === "Struct") {
          let astStructType = astParameter;

          if (!astStructType.extern && astStructType.identifierField.isJust()) {
            // If the struct type has an identifier property, mint a new, anonymous struct type with the other properties
            const fields = astStructType.fields;
            astStructType = new ast.StructType({
              comment: astStructType.comment,
              extern: false,
              fromRdfType: Maybe.empty(),
              identifierType: new ast.BlankNodeType({
                comment: Maybe.empty(),
                label: Maybe.empty(),
                name: Maybe.empty(),
                shapeIdentifier: astStructType.identifierType.shapeIdentifier,
              }),
              label: astStructType.label,
              name: Maybe.empty(),
              shapeIdentifier: astStructType.shapeIdentifier,
              synthetic: false,
              toRdfTypes: [],
              tsImports: [],
            });
            for (const field of fields) {
              if (field.kind === "Identifier") {
                continue;
              }
              invariant(field.kind === "Shacl");
              astStructType.addField(
                new ast.StructType.ShaclField({
                  ...field,
                  structType: astStructType,
                }),
              );
            }
          }

          return Either.of<Error, ast.StructType>(astStructType);
        }

        return Left(
          new Error(
            `expected ${inputOperation} parameter ${inputParameter} to be a struct`,
          ),
        );
      })
      .map(Maybe.of);
  }

  function transformResult(): Either<Error, Maybe<ast.Operation.Result>> {
    const inputResult = inputOperation.result.extract();
    if (!inputResult) {
      return Either.of(Maybe.empty());
    }
    return transformShapeToAstType
      .call(self, inputResult, new ShapeStack())
      .chain<Error, ast.Operation.Result>((type) => {
        if (type.kind === "Struct") {
          return Either.of(type);
        } else if (type.kind === "Option" && type.itemType.kind === "Struct") {
          return Either.of(type as ast.OptionType<ast.StructType>);
        }
        return Left(
          new Error(
            `expected ${inputOperation} result ${inputResult} to be a struct or optional struct`,
          ),
        );
      })
      .map(Maybe.of);
  }

  return Eithers.chain2(transformParameter(), transformResult()).chain(
    ([parameter, result]) => {
      return Eithers.chain3(
        Eithers.chainMap(inputOperation.bindings, (binding) =>
          transformHttpBinding(binding, parameter, result),
        ),
        transformError(),
        astConstructName(inputOperation),
      ).chain(([bindings, error, name]) => {
        return Either.of(
          new ast.Operation({
            bindings,
            comment: inputOperation.comment,
            label: inputOperation.label,
            error,
            name,
            parameter,
            result,
          }),
        );
      });
    },
  );
}

export function transformService(
  this: ShapesGraphToAstTransformer,
  inputService: input.Service,
): Either<Error, ast.Service> {
  return astConstructName(inputService).chain((name) => {
    const astOperations: ast.Operation[] = [];
    for (const inputOperation of inputService.operations) {
      const astOperationEither = transformOperation.call(this, inputOperation);
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
        name,
        operations: astOperations,
      }),
    );
  });
}
