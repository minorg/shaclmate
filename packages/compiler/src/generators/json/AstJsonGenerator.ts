import type { Term as RdfjsTerm } from "@rdfjs/types";
import type * as ast from "../../ast/index.js";
import type { Generator } from "../Generator.js";

namespace AstJson {
  export interface Name {
    identifier: Term;

    [index: string]: boolean | number | object | string | undefined;
  }

  export interface Term {
    termType: RdfjsTerm["termType"];
    value: string;

    [index: string]: string;
  }

  export interface Type {
    kind: ast.Type["kind"];

    [index: string]: boolean | number | object | string | undefined;
  }
}

function nameToJson(name: ast.Name): AstJson.Name {
  return {
    curie: name.curie.extract(),
    identifier: termToJson(name.identifier),
    shName: name.shName.extract(),
    shaclmateName: name.shaclmateName.extract(),
  };
}

function termToJson(term: RdfjsTerm): AstJson.Term {
  switch (term.termType) {
    case "BlankNode":
      return { termType: term.termType, value: term.value };
    case "Literal":
      return {
        datatype: term.datatype.value,
        language: term.language,
        termType: term.termType,
        value: term.value,
      };
    case "NamedNode":
      return { termType: term.termType, value: term.value };
    default:
      throw new Error(`unsupported term type: ${term.termType}`);
  }
}

function typeToJson(type: ast.Type): AstJson.Type {
  switch (type.kind) {
    case "IdentifierType":
      return {
        hasValue: type.hasValues.map(termToJson),
        kind: type.kind,
        nodeKinds: [...type.nodeKinds],
      };
    case "IntersectionType":
    case "UnionType":
      return {
        kind: type.kind,
        types: type.memberTypes.map((type) => typeToJson(type)),
      };
    case "ListType": {
      return {
        itemType: typeToJson(type.itemType),
        kind: type.kind,
        mutable: type.mutable.extract(),
      };
    }
    case "LiteralType": {
      return {
        datatype: type.datatype.extract(),
        hasValue: type.hasValues.map(termToJson),
        kind: type.kind,
        maxExclusive: type.maxExclusive.map(termToJson).extract(),
        maxInclusive: type.maxInclusive.map(termToJson).extract(),
        minExclusive: type.minExclusive.map(termToJson).extract(),
        minInclusive: type.minInclusive.map(termToJson).extract(),
      } satisfies AstJson.Type;
    }
    case "ObjectIntersectionType":
    case "ObjectUnionType":
      return {
        kind: type.kind,
        name: nameToJson(type.name),
        types: type.memberTypes.map((type) => typeToJson(type)),
      };
    case "ObjectType":
      return {
        fromRdfType: type.fromRdfType.map(termToJson).extract(),
        kind: type.kind,
        name: nameToJson(type.name),
        parentObjectTypes:
          type.parentObjectTypes.length > 0
            ? type.parentObjectTypes.map((type) => nameToJson(type.name))
            : undefined,
        identifierIn:
          type.identifierIn.length > 0
            ? type.identifierIn.map(termToJson)
            : undefined,
        identifierKinds: [...type.identifierKinds],
        identifierMintingStrategy: type.identifierMintingStrategy.extract(),
        toRdfTypes:
          type.toRdfTypes.length > 0
            ? type.toRdfTypes.map(termToJson)
            : undefined,
      };
    case "OptionType":
      return {
        itemType: typeToJson(type.itemType),
        kind: type.kind,
      };
    case "PlaceholderType":
      throw new Error(type.kind);
    case "SetType":
      return {
        itemType: typeToJson(type.itemType),
        kind: type.kind,
      };
    case "TermType":
      return {
        kind: type.kind,
      };
  }
}

export class AstJsonGenerator implements Generator {
  generate(ast: ast.Ast): string {
    return JSON.stringify(
      {
        objectTypes: ast.objectTypes.map((objectType) => ({
          kind: objectType.kind,
          name: nameToJson(objectType.name),
          properties: objectType.properties.map((property) => ({
            name: nameToJson(property.name),
            mutable: property.mutable.extract(),
            path: property.path.iri.value,
            type: typeToJson(property.type),
          })),
        })),
      },
      undefined,
      2,
    );
  }
}
