import { type ImportDeclarationStructure, StructureKind } from "ts-morph";

export type Import = ImportDeclarationStructure | string;

/**
 * Singleton values for common imports.
 */
export namespace Import {
  export const DATA_FACTORY: Import = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "@shaclmate/runtime",
    namedImports: ["dataFactory"],
  };

  export const DATASET_FACTORY: Import = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "@shaclmate/runtime",
    namedImports: ["datasetFactory"],
  };

  export const GRAPHQL: Import = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "@shaclmate/runtime",
    namedImports: ["graphql"],
  };

  export const GRAPHQL_SCALARS: Import = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "@shaclmate/runtime",
    namedImports: ["graphqlScalars"],
  };

  export const PURIFY: Import = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "@shaclmate/runtime",
    namedImports: ["purify"],
  };

  export const RDF_LITERAL: Import = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "@shaclmate/runtime",
    namedImports: ["rdfLiteral"],
  };

  export const RDFJS_RESOURCE: Import = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "@shaclmate/runtime",
    namedImports: ["rdfjsResource"],
  };

  export const RDFJS_TYPES: Import = {
    isTypeOnly: true,
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "@shaclmate/runtime",
    namedImports: ["rdfjs"],
  };

  export const SHA256: Import = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "@shaclmate/runtime",
    namedImports: ["sha256"],
  };

  export const SPARQLJS: Import = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "@shaclmate/runtime",
    namedImports: ["sparqljs"],
  };

  export const UUID: Import = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "@shaclmate/runtime",
    namedImports: ["uuid"],
  };

  export const ZOD: Import = {
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: "@shaclmate/runtime",
    namedImports: ["zod"],
  };
}
