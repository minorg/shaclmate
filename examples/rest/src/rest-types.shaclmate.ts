import type { BlankNode, NamedNode } from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import { NTriplesIdentifier, NTriplesTerm } from "@rdfx/string";
import type { Either } from "purify-ts";

const $parseIdentifier = NTriplesIdentifier.parser(dataFactory);

export type ExampleError = {
  readonly $identifier: () => ExampleError.Identifier;

  readonly $type: "ExampleError";

  readonly message: string;
};

export namespace ExampleError {
  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
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
