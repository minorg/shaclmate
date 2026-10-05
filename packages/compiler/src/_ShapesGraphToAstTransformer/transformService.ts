import { Curie } from "@shaclmate/shacl-ast";
import { Either, Left, Maybe } from "purify-ts";
import * as ast from "../ast/index.js";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";

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
  return astConstructName(inputOperation).chain((name) => {
    return Either.of(
      new ast.Operation({
        comment: inputOperation.comment,
        label: inputOperation.label,
        name,
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
