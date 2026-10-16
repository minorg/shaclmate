export type TsFeature = (typeof TS_FEATURES)[number];

export const TS_FEATURES = [
  "GraphQL",
  "JSON",
  "LoggingService",
  "Object.create",
  "Object.equals",
  "Object.filter",
  "Object.fromJson",
  "Object.fromRdf",
  "Object.hash",
  "Object.JSON",
  "Object.JSON.type",
  "Object.JSON.parse",
  "Object.JSON.schema",
  "Object.JSON.uiSchema",
  "Object.RDF",
  "Object.schema",
  "Object.SPARQL",
  "Object.toJson",
  "Object.toLoggable",
  "Object.toRdf",
  "Object.toString",
  "Object.type",
  "ObjectSet",
  "RDF",
  "RdfjsDatasetObjectSet",
  "SPARQL",
  "SparqlObjectSet",
  "Service",
  "ServiceHttpApi",
  "ServiceHttpClient",
] as const;

export namespace TsFeature {
  export const dependencies: Record<TsFeature, TsFeature[]> = {
    GraphQL: ["ObjectSet"],

    // Alias for other features, not dependencies per se
    JSON: ["Object.JSON"],

    LoggingService: ["Object.toLoggable", "Service"],

    "Object.create": ["Object.schema", "Object.toString", "Object.type"],

    "Object.equals": ["Object.type"],

    "Object.filter": ["Object.type"],

    "Object.fromJson": ["Object.create", "Object.JSON.type", "Object.type"],

    "Object.fromRdf": ["Object.create", "Object.schema"],

    "Object.hash": [],

    // Alias for other features, not dependencies per se
    "Object.JSON": [
      "Object.fromJson",
      "Object.JSON.parse",
      "Object.JSON.schema",
      "Object.JSON.type",
      "Object.JSON.uiSchema",
      "Object.toJson",
    ],

    "Object.JSON.parse": ["Object.JSON.schema", "Object.JSON.type"],

    "Object.JSON.type": [],

    "Object.JSON.schema": ["Object.JSON.type"],

    "Object.JSON.uiSchema": [],

    // Alias for other features, not dependencies per se
    "Object.RDF": ["Object.fromRdf", "Object.toRdf"],

    "Object.schema": [],

    "Object.toJson": ["Object.JSON.type", "Object.type"],

    "Object.toLoggable": ["Object.type"],

    "Object.toRdf": ["Object.schema", "Object.type"],

    "Object.toString": ["Object.type"],

    "Object.SPARQL": ["Object.schema"],

    "Object.type": [], // Implies Object.Identifier

    ObjectSet: ["Object.filter"],

    // Alias for other features, not dependencies per se
    RDF: ["Object.RDF", "RdfjsDatasetObjectSet"],

    RdfjsDatasetObjectSet: ["Object.fromRdf", "ObjectSet"],

    Service: ["Object.type"],

    ServiceHttpApi: ["Service"],

    ServiceHttpClient: ["Service"],

    SPARQL: ["Object.SPARQL", "SparqlObjectSet"],

    SparqlObjectSet: ["Object.SPARQL", "ObjectSet"],
  };
}
