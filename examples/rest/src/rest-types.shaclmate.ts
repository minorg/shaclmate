import type { BlankNode, NamedNode } from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import { NTriplesIdentifier } from "@rdfx/string";
import { Either, Left, Right } from "purify-ts";

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

function $monkeyPatchObject<T extends object>(
  obj: T,
  methods: { toJson?: (obj: T) => object; $toString?: (obj: T) => string },
): T {
  if (
    methods.toJson &&
    (!globalThis.Object.prototype.hasOwnProperty.call(obj, "toJSON") ||
      typeof (obj as any).toJSON === "function")
  ) {
    const toJsonMethod = methods.toJson;
    (obj as any).toJSON = function (this: T, _key: string) {
      return toJsonMethod(this);
    };
  }

  if (
    methods.$toString &&
    (!globalThis.Object.prototype.hasOwnProperty.call(obj, "toString") ||
      typeof (obj as any).toJSON === "function")
  ) {
    const toStringMethod = methods.$toString;
    (obj as any).toString = function (this: T) {
      return toStringMethod(this);
    };
  }

  return obj;
}

/**
 * NamespaceBuilder type excerpted from @rdfjs/namespace (MIT license) in lieu of a type import.
 */
export type $NamespaceBuilder<TermNames extends string = any> = Record<
  TermNames,
  NamedNode
> &
  ((property?: TemplateStringsArray | TermNames) => NamedNode);

export function $parseBlankNode(identifier: string): Either<Error, BlankNode> {
  return $parseIdentifier(identifier).chain((identifier) =>
    identifier.termType === "BlankNode"
      ? Right(identifier)
      : Left(new Error("expected identifier to be BlankNode")),
  ) as Either<Error, BlankNode>;
}

const $parseIdentifier = NTriplesIdentifier.parser(dataFactory);

function $sequenceRecord<T extends Record<string, unknown>>(
  record: { [K in keyof T]: Either<Error, T[K]> },
): Either<Error, T> {
  const result: { [K in keyof T]?: T[K] } = {};

  for (const key of globalThis.Object.keys(record) as Array<keyof T>) {
    const either = record[key];
    if (either.isLeft()) {
      return either as unknown as Either<Error, T>;
    }
    result[key] = either.extract() as T[typeof key];
  }

  return Right(result as T);
}

export type ExampleError = {
  readonly $type: "ExampleError";
  readonly message: string;
};

export namespace ExampleError {
  export const $toString: (_exampleError: ExampleError) => string = (
    _exampleError,
  ) => `ExampleError(${JSON.stringify(toStringRecord(_exampleError))})`;

  export const create = <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(parameters: {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly message: string;
  }): Either<Error, ExampleError> =>
    $sequenceRecord({ message: Either.of(parameters.message) })
      .map((properties) => ({
        ...properties,
        $type: "ExampleError" as const,
      }))
      .map((object) =>
        $monkeyPatchObject(object, { $toString: ExampleError.$toString }),
      );

  export function createUnsafe<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(parameters: {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly message: string;
  }): ExampleError {
    return create(parameters).unsafeCoerce();
  }

  export type Identifier = BlankNode;
  export namespace Identifier {
    export const parse = $parseBlankNode;
  }

  export const isExampleError = (object: $Object): object is ExampleError =>
    object.$type === "ExampleError";

  export const schema = {
    properties: {
      $type: { kind: "Discriminant", value: "ExampleError" },
      message: { kind: "Shacl", type: { kind: "String" as const } },
    },
  } as const;

  export type Schema = typeof schema;

  export const toStringRecord: (
    _exampleError: ExampleError,
  ) => Record<string, string> = (_exampleError) => $compactRecord({});
}

export type $Object = ExampleError;

export namespace $Object {
  export const $toString = ExampleError.$toString;
}

export interface ExampleService {
  get(parameters: {
    readonly identifier: NamedNode;
  }): Promise<Either<ExampleError, string>>;
}
