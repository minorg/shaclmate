import { imp } from "./ts-poet-wrapper.js";

export class Imports {
  readonly BigDecimal = imp("Decimal:BigDecimal@decimal.js");
  readonly BlankNode = imp("BlankNode@@rdfjs/types");
  readonly dataFactory = imp("dataFactory=@rdfx/data-factory");
  readonly DatasetCore = imp("DatasetCore@@rdfjs/types");
  readonly datasetFactory = imp("datasetFactory@@rdfx/collection");
  readonly Either = imp("Either@purify-ts");
  readonly EitherAsync = imp("EitherAsync@purify-ts");
  readonly GraphQLBigInt = imp("BigInt:GraphQLBigInt@graphql-scalars");
  readonly GraphQLBoolean = imp("GraphQLBoolean@graphql");
  readonly GraphQLDate = imp("Date:GraphQLDate@graphql-scalars");
  readonly GraphQLDateTime = imp("DateTime:GraphQLDateTime@graphql-scalars");
  readonly GraphQLFloat = imp("GraphQLFloat@graphql");
  readonly GraphQLID = imp("GraphQLID@graphql");
  readonly GraphQLInt = imp("GraphQLInt@graphql");
  readonly GraphQLList = imp("GraphQLList@graphql");
  readonly GraphQLNonNull = imp("GraphQLNonNull@graphql");
  readonly GraphQLObjectType = imp("GraphQLObjectType@graphql");
  readonly GraphQLSchema = imp("GraphQLSchema@graphql");
  readonly GraphQLString = imp("GraphQLString@graphql");
  readonly GraphQLUnionType = imp("GraphQLUnionType@graphql");
  readonly Left = imp("Left@purify-ts");
  readonly Literal = imp("Literal@@rdfjs/types");
  readonly LiteralFactory = imp("LiteralFactory@@rdfx/literal");
  readonly Maybe = imp("Maybe@purify-ts");
  readonly NamedNode = imp("NamedNode@@rdfjs/types");
  readonly NonEmptyList = imp("NonEmptyList@purify-ts");
  readonly NTriplesIdentifier = imp("NTriplesIdentifier@@rdfx/string");
  readonly NTriplesTerm = imp("NTriplesTerm@@rdfx/string");
  readonly Quad = imp("Quad@@rdfjs/types");
  readonly Quad_Graph = imp("Quad_Graph@@rdfjs/types");
  readonly RdfxResourcePropertyPath = imp(
    "PropertyPath:RdfxResourcePropertyPath@@rdfx/resource",
  );
  readonly Resource = imp("Resource@@rdfx/resource");
  readonly ResourceSet = imp("ResourceSet@@rdfx/resource");
  readonly Right = imp("Right@purify-ts");
  readonly sparqljs = imp("sparqljs*sparqljs");
  readonly Variable = imp("Variable@@rdfjs/types");
  readonly z = imp("z@zod");
}
