import type { AbstractType } from "../AbstractType.js";
import type { Typeof } from "../Typeof.js";

export type AbstractDiscriminatedUnionType_Discriminant =
  | ExtrinsicDiscriminant
  | HybridDiscriminant
  | IntrinsicDiscriminant
  | TypeofDiscriminant;

type ExtrinsicDiscriminant = {
  readonly kind: "Extrinsic";
  readonly memberValues: readonly AbstractType.DiscriminantProperty.Value[];
  readonly name: string;
};

type HybridDiscriminant = {
  readonly kind: "Hybrid";
  readonly memberValues: readonly {
    readonly kind: "Extrinsic" | "Intrinsic";
    readonly values: readonly AbstractType.DiscriminantProperty.Value[];
  }[];
  readonly name: string;
};

type IntrinsicDiscriminant = {
  readonly kind: "Intrinsic";
  readonly memberValues: readonly AbstractType.DiscriminantProperty.Value[];
  readonly name: string;
};

type TypeofDiscriminant = {
  readonly kind: "Typeof";
  readonly memberValues: readonly Typeof[];
};
