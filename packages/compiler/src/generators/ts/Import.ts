import { type ImportDeclarationStructure, StructureKind } from "ts-morph";

export type Import = ImportDeclarationStructure | string;

/**
 * Singleton values for common imports.
 */
export namespace Import {
  export const DATA_FACTORY: Import = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "n3",
    namedImports: [{ alias: "dataFactory", name: "DataFactory" }],
  };

  export const DATASET_FACTORY: Import =
    "import { StoreFactory as _DatasetFactory } from 'n3'; const datasetFactory = new _DatasetFactory();";

  export const GRAPHQL: Import = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "graphql",
    namespaceImport: "graphql",
  };

  export const GRAPHQL_SCALARS: Import = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "graphql-scalars",
    namespaceImport: "graphqlScalars",
  };

  export const PURIFY: Import = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "purify-ts",
    namespaceImport: "purify",
  };

  export const RDF_LITERAL: Import = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "rdf-literal",
    namespaceImport: "rdfLiteral",
  };

  export const RDFJS_RESOURCE: Import = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "rdfjs-resource",
    namespaceImport: "rdfjsResource",
  };

  export const RDFJS_TYPES: Import = {
    isTypeOnly: true,
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "@rdfjs/types",
    namespaceImport: "rdfjs",
  };

  export const SHA256: Import = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "js-sha256",
    namedImports: ["sha256"],
  };

  export const SPARQLJS: Import = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "sparqljs",
    namespaceImport: "sparqljs",
  };

  export const UUID: Import = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "uuid",
    namespaceImport: "uuid",
  };

  export const ZOD: Import = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "zod",
    namedImports: [{ alias: "zod", name: "z" }],
  };
}
