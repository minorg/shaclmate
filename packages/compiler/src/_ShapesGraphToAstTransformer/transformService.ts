import { Curie } from "@shaclmate/shacl-ast";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import * as ast from "../ast/index.js";
import { Eithers } from "../Eithers.js";
import type * as input from "../input/index.js";
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

  function transformParameter(): Either<Error, Maybe<ast.StructType>> {
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

        return Left(new Error(`expected ${inputParameter} to be a struct`));
      })
      .map(Maybe.of);
  }

  function transformResult(): Either<Error, Maybe<ast.Type>> {
    const inputResult = inputOperation.result.extract();
    if (!inputResult) {
      return Either.of(Maybe.empty());
    }
    return transformShapeToAstType
      .call(self, inputResult, new ShapeStack())
      .map(Maybe.of);
  }

  return Eithers.chain4(
    transformError(),
    astConstructName(inputOperation),
    transformParameter(),
    transformResult(),
  ).chain(([error, name, parameter, result]) => {
    return Either.of(
      new ast.Operation({
        comment: inputOperation.comment,
        label: inputOperation.label,
        error,
        name,
        parameter,
        result,
      }),
    );
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
