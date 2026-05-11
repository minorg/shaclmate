export type TsFeature = (typeof TS_FEATURES)[number];

export const TS_FEATURES = [
  "create",
  "equals",
  "graphql",
  "hash",
  "json",
  "rdf",
  "sparql",
] as const;
