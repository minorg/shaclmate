export type TsFeature =
  | "create"
  | "equals"
  | "hash"
  | "json"
  | "rdf"
  | "sparql";

export namespace TsFeature {
  export const MEMBERS: readonly TsFeature[] = [
    "create",
    "equals",
    "hash",
    "json",
    "rdf",
    "sparql",
  ];
}
