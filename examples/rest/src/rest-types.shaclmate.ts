import type { BlankNode, NamedNode } from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import { NTriplesIdentifier } from "@rdfx/string";
import { type Either, Left, Right } from "purify-ts";

export function $parseBlankNode(identifier: string): Either<Error, BlankNode> {
  return $parseIdentifier(identifier).chain((identifier) =>
    identifier.termType === "BlankNode"
      ? Right(identifier)
      : Left(new Error("expected identifier to be BlankNode")),
  ) as Either<Error, BlankNode>;
}

const $parseIdentifier = NTriplesIdentifier.parser(dataFactory);

export type ExampleError = {
  readonly $identifier: () => ExampleError.Identifier;

  readonly $type: "ExampleError";

  readonly message: string;
};

export namespace ExampleError {
  export type Identifier = BlankNode;
  export namespace Identifier {
    export const parse = $parseBlankNode;
  }

  export const isExampleError = (object: $Object): object is ExampleError =>
    object.$type === "ExampleError";
}

export type $Object = ExampleError;

export interface ExampleService {
  get(parameters: {
    readonly identifier: NamedNode;
  }): Promise<Either<ExampleError, string>>;
}
