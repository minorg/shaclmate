import type { BlankNode, NamedNode } from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import type { Logger } from "@rdfx/logger";
import { NTriplesIdentifier } from "@rdfx/string";
import { type Either, Left, Right } from "purify-ts";

/**
 * Remove undefined values from a record.
 */
function $compactRecord<KeyT extends string, ValueT extends {}>(
  record: Record<KeyT, ValueT | undefined>,
): Record<KeyT, ValueT> {
  return globalThis.Object.entries(record).reduce(
    (definedProperties, [propertyName, propertyValue]) => {
      if (propertyValue !== undefined) {
        definedProperties[propertyName as KeyT] = propertyValue as ValueT;
      }
      return definedProperties;
    },
    {} as Record<KeyT, ValueT>,
  );
}

export function $parseBlankNode(identifier: string): Either<Error, BlankNode> {
  return $parseIdentifier(identifier).chain((identifier) =>
    identifier.termType === "BlankNode"
      ? Right(identifier)
      : Left(new Error("expected identifier to be BlankNode")),
  ) as Either<Error, BlankNode>;
}

const $parseIdentifier = NTriplesIdentifier.parser(dataFactory);

export type ExampleError = {
  readonly $type: "ExampleError";
  readonly message: string;
};

export namespace ExampleError {
  export const $toLoggable = (_exampleError: ExampleError) =>
    $compactRecord({ $type: "ExampleError", message: _exampleError.message });

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

export class LoggingExampleService implements ExampleService {
  private readonly delegate: ExampleService;
  private readonly logger: Logger;

  constructor({
    delegate,
    logger,
  }: { delegate: ExampleService; logger: Logger }) {
    this.delegate = delegate;
    this.logger = logger;
  }

  async get(parameters: {
    readonly identifier: NamedNode;
  }): Promise<Either<ExampleError, string>> {
    const logContext: Record<string, unknown> = {
      identifier: parameters.identifier.value,
    };
  }
}
