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

  function transformHttpBinding({
    astError,
    astParameter,
    astResult,
    inputHttpBinding,
  }: {
    astError: Maybe<ast.StructType | ast.StructDiscriminatedUnionType>;
    astParameter: Maybe<ast.Operation.Parameter>;
    astResult: Maybe<ast.Operation.Result>;
    inputHttpBinding: OperationHttpBinding;
  }): Either<Error, ast.Operation.HttpBinding> {
    function transformErrorResponses(): Either<
      Error,
      readonly ast.Operation.HttpBinding.ErrorResponse[]
    > {
      const astErrorStructTypes: readonly ast.StructType[] = astError
        .toList()
        .flatMap((astError) => {
          switch (astError.kind) {
            case "DiscriminatedUnion":
              return astError.members.map(
                (member) => member.type as ast.StructType,
              );
            case "Struct":
              return [astError];
            default:
              astError satisfies never;
              throw new Error("should never reach this point");
          }
        });

      return Either.encase(() =>
        inputHttpBinding.errorResponses.map((inputErrorResponse) => {
          const error = astErrorStructTypes.find((astErrorStructType) =>
            astErrorStructType.shapeIdentifier.equals(inputErrorResponse.error),
          );
          if (!error) {
            throw new Error(
              `${inputOperation.$identifier()} HTTP binding error response ${inputErrorResponse.$identifier()} references error ${inputErrorResponse.error} that is not associated with the operation`,
            );
          }
          if (error.name.isNothing()) {
            throw new Error(
              `${inputOperation.$identifier()} HTTP binding error response ${inputErrorResponse.$identifier()} references unnamed error ${inputErrorResponse.error}`,
            );
          }

          return {
            contentType: "application/problem+json",
            error,
            statusCode: inputErrorResponse.statusCode,
          } satisfies ast.Operation.HttpBinding.ErrorResponse;
        }),
      );
    }

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
        const parameterSources = new Map<
          string,
          ast.Operation.HttpBinding.Request.ParameterSource
        >();

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

        let bodyParametersCount = 0;
        for (const parameterName of parameterNames) {
          if (!parameterSources.has(parameterName)) {
            parameterSources.set(parameterName, "body");
            bodyParametersCount++;
          }
        }

        let method = inputRequest.method.extract();
        if (!method) {
          if (bodyParametersCount > 0) {
            method = "POST";
          } else {
            method = "GET";
          }
        }

        let contentType = inputRequest.contentType.extract();
        if (!contentType) {
          if (bodyParametersCount > 0) {
            contentType = "application/json";
          }
        }

        return {
          contentType: Maybe.fromNullable(contentType),
          method,
          parameterSources,
          uriTemplate: parsedUrlTemplate.ast,
        } satisfies ast.Operation.HttpBinding.Request;
      });
    }

    function transformResultResponse(): Either<
      Error,
      ast.Operation.HttpBinding.ResultResponse
    > {
      const inputResultResponse = inputHttpBinding.resultResponse.extract();

      if (astResult.isJust()) {
        if (inputResultResponse) {
          let contentType = inputResultResponse.contentType.extract();
          const astResult_ = astResult.extract();
          if (astResult_) {
            contentType = "application/json";
          }

          return Either.of({
            contentType: Maybe.fromNullable(contentType),
            statusCode: inputResultResponse.statusCode,
          });
        } else {
          return Either.of({
            contentType: Maybe.of("application/json"),
            statusCode: 200,
          });
        }
      } else {
        if (inputResultResponse) {
          return Left(
            new Error(
              `${inputOperation.$identifier()} has HTTP result response binding but no result specified`,
            ),
          );
        }

        return Either.of({
          contentType: Maybe.empty(),
          statusCode: 204,
        });
      }
    }

    return Eithers.chain3(
      transformErrorResponses(),
      transformRequest(),
      transformResultResponse(),
    ).chain(([errorResponses, request, resultResponse]) =>
      Either.of({
        errorResponses,
        request,
        resultResponse,
      }),
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

  return Eithers.chain3(
    transformError(),
    transformParameter(),
    transformResult(),
  ).chain(([error, parameter, result]) => {
    return Eithers.chain2(
      Eithers.chainMap(inputOperation.bindings, (binding) =>
        transformHttpBinding({
          astError: error,
          astParameter: parameter,
          astResult: result,
          inputHttpBinding: binding,
        }),
      ),
      astConstructName(inputOperation),
    ).chain(([bindings, name]) => {
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
  });
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
