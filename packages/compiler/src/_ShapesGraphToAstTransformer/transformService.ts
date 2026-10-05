import { Curie } from "@shaclmate/shacl-ast";
import { Either, Left, Maybe } from "purify-ts";
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
      `${object.$type} ${objectIdentifier} has a blank node identifier and no shaclmate:name`,
    ),
  );
}

function transformOperation(
  this: ShapesGraphToAstTransformer,
  inputOperation: input.Operation,
): Either<Error, ast.Operation> {
  const self = this;

  function transformParameters(): Either<Error, Maybe<ast.StructType>> {
    const inputParameters = inputOperation.parameters.extract();
    if (!inputParameters) {
      return Either.of(Maybe.empty());
    }
    return transformShapeToAstType
      .call(self, inputParameters, new ShapeStack())
      .chain((astParameters) => {
        if (astParameters.kind !== "Struct") {
          return Left(new Error(`${inputOperation} has non-struct parameters`));
        }
        return Either.of<Error, ast.StructType>(astParameters);
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

  return Eithers.chain3(
    astConstructName(inputOperation),
    transformParameters(),
    transformResult(),
  ).chain(([name, parameters, result]) => {
    return Either.of(
      new ast.Operation({
        comment: inputOperation.comment,
        label: inputOperation.label,
        name,
        parameters,
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
