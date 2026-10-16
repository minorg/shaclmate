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

export type ForbiddenError = {
  readonly $type: "ForbiddenError";
  readonly message: string;
};

export namespace ForbiddenError {
  export const $toString: (_forbiddenError: ForbiddenError) => string = (
    _forbiddenError,
  ) => `ForbiddenError(${JSON.stringify(toStringRecord(_forbiddenError))})`;

  export const create = <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(parameters: {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly message: string;
  }): Either<Error, ForbiddenError> =>
    $sequenceRecord({ message: Either.of(parameters.message) })
      .map((properties) => ({
        ...properties,
        $type: "ForbiddenError" as const,
      }))
      .map((object) =>
        $monkeyPatchObject(object, { $toString: ForbiddenError.$toString }),
      );

  export function createUnsafe<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(parameters: {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly message: string;
  }): ForbiddenError {
    return create(parameters).unsafeCoerce();
  }

  export type Identifier = BlankNode;
  export namespace Identifier {
    export const parse = $parseBlankNode;
  }

  export const isForbiddenError = (object: $Object): object is ForbiddenError =>
    object.$type === "ForbiddenError";

  export const schema = {
    properties: {
      $type: { kind: "Discriminant", value: "ForbiddenError" },
      message: { kind: "Shacl", type: { kind: "String" as const } },
    },
  } as const;

  export type Schema = typeof schema;

  export const toStringRecord: (
    _forbiddenError: ForbiddenError,
  ) => Record<string, string> = (_forbiddenError) => $compactRecord({});
}

export type PaymentRequiredError = {
  readonly $type: "PaymentRequiredError";
  readonly message: string;
};

export namespace PaymentRequiredError {
  export const $toString: (
    _paymentRequiredError: PaymentRequiredError,
  ) => string = (_paymentRequiredError) =>
    `PaymentRequiredError(${JSON.stringify(toStringRecord(_paymentRequiredError))})`;

  export const create = <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(parameters: {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly message: string;
  }): Either<Error, PaymentRequiredError> =>
    $sequenceRecord({ message: Either.of(parameters.message) })
      .map((properties) => ({
        ...properties,
        $type: "PaymentRequiredError" as const,
      }))
      .map((object) =>
        $monkeyPatchObject(object, {
          $toString: PaymentRequiredError.$toString,
        }),
      );

  export function createUnsafe<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(parameters: {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly message: string;
  }): PaymentRequiredError {
    return create(parameters).unsafeCoerce();
  }

  export type Identifier = BlankNode;
  export namespace Identifier {
    export const parse = $parseBlankNode;
  }

  export const isPaymentRequiredError = (
    object: $Object,
  ): object is PaymentRequiredError => object.$type === "PaymentRequiredError";

  export const schema = {
    properties: {
      $type: { kind: "Discriminant", value: "PaymentRequiredError" },
      message: { kind: "Shacl", type: { kind: "String" as const } },
    },
  } as const;

  export type Schema = typeof schema;

  export const toStringRecord: (
    _paymentRequiredError: PaymentRequiredError,
  ) => Record<string, string> = (_paymentRequiredError) => $compactRecord({});
}

export type $Object = ForbiddenError | PaymentRequiredError;

export namespace $Object {
  export function $toString(object: $Object) {
    switch (object.$type) {
      case "ForbiddenError":
        return ForbiddenError.$toString(object);
      case "PaymentRequiredError":
        return PaymentRequiredError.$toString(object);
      default:
        object satisfies never;
        throw new Error("should never reach this point");
    }
  }
}

export interface ExampleService {
  get(parameters: { readonly identifier: NamedNode }): Promise<
    Either<
      ForbiddenError | PaymentRequiredError,
      {
        readonly $identifier: () => BlankNode | NamedNode;
        readonly result: string;
      }
    >
  >;
}
