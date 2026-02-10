import { imp } from "ts-poet";

export const sharedImports = {
  dataFactory: imp("DataFactory:dataFactory@n3"),
  DatasetFactory: imp("DataSetFactory@n3"),
  // export const DATASET_FACTORY: Import =
  //   "import { StoreFactory as _DatasetFactory } from 'n3'; const datasetFactory = new _DatasetFactory();";

  // export const GRAPHQL_SCALARS: Import = {
  //   kind: StructureKind.ImportDeclaration,
  //   moduleSpecifier: "graphql-scalars",
  //   namespaceImport: "graphqlScalars",
  // };
  BlankNode: imp("BlankNode@@rdfjs/types"),
  Either: imp("Either@purify-ts"),
  GraphQLBoolean: imp("GraphQLBoolean@graphql"),
  GraphQLDate: imp("Date:GraphQLDate@graphql-scalars"),
  GraphQLDateTime: imp("DateTime:GraphQLDateTime@graphql-scalars"),
  GraphQLFloat: imp("GraphQLFloat@graphql"),
  GraphQLInt: imp("GraphQLInt@graphql"),
  GraphQLList: imp("GraphQLList@graphql"),
  GraphQLString: imp("GraphQLString@graphql"),
  Left: imp("Left@purify-ts"),
  Literal: imp("Literal@@rdfjs/types"),
  Maybe: imp("Maybe@purify-ts"),
  NamedNode: imp("NamedNode@@rdfjs/types"),
  NonEmptyList: imp("NonEmptyList@purify-ts"),
  Resource: imp("Resource@rdfjs-resource"),
  sha256: imp("sha256@js-sha256"),
  sparqljs: imp("sparqljs*@sparqljs"),
  uuid: imp("uuid*@uuid"),
  Variable: imp("Variable@@rdfjs/types"),
  z: imp("z@zod"),
} as const;
