import type { NamedNode } from "@rdfjs/types";
import { StoreFactory as DatasetFactory, DataFactory as dataFactory } from "n3";
import { Either, Left } from "purify-ts";
import { type MutableResource, MutableResourceSet } from "rdfjs-resource";

/**
 * Compare two objects with equals(other: T): boolean methods and return an $EqualsResult.
 */
function $booleanEquals<T extends { equals: (other: T) => boolean }>(
  left: T,
  right: T,
): $EqualsResult {
  return $EqualsResult.fromBooleanEqualsResult(left, right, left.equals(right));
}
const $datasetFactory = new DatasetFactory();
export type $EqualsResult = Either<$EqualsResult.Unequal, true>;

export namespace $EqualsResult {
  export const Equal: $EqualsResult = Either.of<Unequal, true>(true);

  export function fromBooleanEqualsResult(
    left: any,
    right: any,
    equalsResult: boolean | $EqualsResult,
  ): $EqualsResult {
    if (typeof equalsResult !== "boolean") {
      return equalsResult;
    }

    if (equalsResult) {
      return Equal;
    }

    return Left({ left, right, type: "BooleanEquals" });
  }

  export type Unequal =
    | {
        readonly left: {
          readonly array: readonly any[];
          readonly element: any;
          readonly elementIndex: number;
        };
        readonly right: {
          readonly array: readonly any[];
          readonly unequals: readonly Unequal[];
        };
        readonly type: "ArrayElement";
      }
    | {
        readonly left: readonly any[];
        readonly right: readonly any[];
        readonly type: "ArrayLength";
      }
    | {
        readonly left: any;
        readonly right: any;
        readonly type: "BooleanEquals";
      }
    | { readonly left: any; readonly right: any; readonly type: "LeftError" }
    | { readonly right: any; readonly type: "LeftNull" }
    | {
        readonly left: bigint | boolean | number | string;
        readonly right: bigint | boolean | number | string;
        readonly type: "Primitive";
      }
    | {
        readonly left: any;
        readonly right: any;
        readonly propertyName: string;
        readonly propertyValuesUnequal: Unequal;
        readonly type: "Property";
      }
    | { readonly left: any; readonly right: any; readonly type: "RightError" }
    | { readonly left: any; readonly type: "RightNull" };
}
type $Hasher = {
  update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
}; /**
 * Compare two values for strict equality (===), returning an $EqualsResult rather than a boolean.
 */

function $strictEquals<T extends bigint | boolean | number | string>(
  left: T,
  right: T,
): $EqualsResult {
  return $EqualsResult.fromBooleanEqualsResult(left, right, left === right);
}
export class $NamedDefaultPartial {
  readonly $identifier: $NamedDefaultPartial.$Identifier;
  readonly $type: "$NamedDefaultPartial" = "$NamedDefaultPartial" as const;
  constructor(parameters: { readonly $identifier: NamedNode | string }) {
    if (typeof parameters.$identifier === "object") {
      this.$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this.$identifier = dataFactory.namedNode(parameters.$identifier);
    } else {
      this.$identifier = parameters.$identifier satisfies never;
    }
  }
  $equals(other: $NamedDefaultPartial): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }
  $hash<HasherT extends $Hasher>(_hasher: HasherT): HasherT {
    this.$hashShaclProperties(_hasher);
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    return _hasher;
  }
  protected $hashShaclProperties<HasherT extends $Hasher>(
    _hasher: HasherT,
  ): HasherT {
    return _hasher;
  }
  $toJson(): $NamedDefaultPartial.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id": this.$identifier.value,
        $type: this.$type,
      } satisfies $NamedDefaultPartial.$Json),
    );
  }
  $toRdf(options?: {
    ignoreRdfType?: boolean;
    mutateGraph?: MutableResource.MutateGraph;
    resourceSet?: MutableResourceSet;
  }): MutableResource<NamedNode> {
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new MutableResourceSet({
        dataFactory,
        dataset: $datasetFactory.dataset(),
      });
    const resource = resourceSet.mutableNamedResource(this.$identifier, {
      mutateGraph,
    });
    return resource;
  }
  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}
