import type { Term as RdfjsTerm } from "@rdfjs/types";
import { Resource } from "rdfjs-resource";
import type * as ast from "../../ast/index.js";
import type { Generator } from "../Generator.js";

namespace AstJson {
  export interface Name {
    identifier:
      | { termType: "BlankNode"; value: string }
      | ({ termType: "NamedNode"; value: string } & {
          curie?: string;
          uniqueLocalPart?: string;
        });

    [index: string]: boolean | number | object | string | undefined;
  }

  export interface Term {
    termType: RdfjsTerm["termType"];
    value: string;

    [index: string]: string;
  }

  export interface Type {
    comment?: string;
    kind: ast.Type["kind"];
    label?: string;
    name?: string;

    [index: string]: boolean | number | object | string | undefined;
  }
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
  const common = {
    kind: type.kind as AstJson.Type["kind"],
    comment: type.comment.extract(),
    label: type.label.extract(),
    name: type.name.extract(),
  };

  switch (type.kind) {
    case "IdentifierType":
      return {
        ...common,
        hasValue: type.hasValues.map(termToJson),
        nodeKinds: [...type.nodeKinds],
      };
    case "IntersectionType":
    case "UnionType":
      return {
        ...common,
        types: type.memberTypes.map((type) => typeToJson(type)),
      };
    case "LazyObjectOptionType":
    case "LazyObjectSetType":
    case "LazyObjectType":
      return {
        ...common,
        partialType: typeToJson(type.partialType),
        resolvedType: typeToJson(type.resolvedType),
      };
    case "ListType": {
      return {
        ...common,
        itemType: typeToJson(type.itemType),
        mutable: type.mutable,
      };
    }
    case "LiteralType": {
      return {
        ...common,
        datatype: type.datatype.extract(),
        hasValue: type.hasValues.map(termToJson),
        maxExclusive: type.maxExclusive.map(termToJson).extract(),
        maxInclusive: type.maxInclusive.map(termToJson).extract(),
        minExclusive: type.minExclusive.map(termToJson).extract(),
        minInclusive: type.minInclusive.map(termToJson).extract(),
      } satisfies AstJson.Type;
    }
    case "ObjectIntersectionType":
    case "ObjectUnionType":
      return {
        ...common,
        shapeIdentifier: Resource.Identifier.toString(type.shapeIdentifier),
        types: type.memberTypes.map((type) => typeToJson(type)),
      };
    case "ObjectType":
      return {
        ...common,
        fromRdfType: type.fromRdfType.map(termToJson).extract(),
        parentObjectTypes:
          type.parentObjectTypes.length > 0
            ? type.parentObjectTypes.map((type) =>
                Resource.Identifier.toString(type.shapeIdentifier),
              )
            : undefined,
        identifierMintingStrategy: type.identifierMintingStrategy.extract(),
        identifierType: typeToJson(type.identifierType),
        shapeIdentifier: Resource.Identifier.toString(type.shapeIdentifier),
        synthetic: type.synthetic ? true : undefined,
        toRdfTypes:
          type.toRdfTypes.length > 0
            ? type.toRdfTypes.map(termToJson)
            : undefined,
      };
    case "OptionType":
      return {
        ...common,
        itemType: typeToJson(type.itemType),
      };
    case "PlaceholderType":
      throw new Error(type.kind);
    case "SetType":
      return {
        ...common,
        itemType: typeToJson(type.itemType),
      };
    case "TermType":
      return {
        ...common,
      };
  }
}

export class AstJsonGenerator implements Generator {
  generate(ast: ast.Ast): string {
    return JSON.stringify(
      {
        objectTypes: ast.objectTypes.map((objectType) => ({
          kind: objectType.kind,
          name: objectType.name.extract(),
          properties: objectType.properties.map((property) => ({
            comment: property.comment.extract(),
            description: property.description.extract(),
            label: property.label.extract(),
            mutable: property.mutable,
            name: property.name.extract(),
            order: property.order,
            path: property.path.value,
            recursive: property.recursive ? true : undefined,
            shapeIdentifier: Resource.Identifier.toString(
              property.shapeIdentifier,
            ),
            type: typeToJson(property.type),
            visibility: property.visibility,
          })),
        })),
      },
      undefined,
      2,
    );
  }
}
