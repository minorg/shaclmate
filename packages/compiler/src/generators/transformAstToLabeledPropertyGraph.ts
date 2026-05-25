import type { BlankNode, NamedNode } from "@rdfjs/types";
import { Maybe } from "purify-ts";
import type * as ast from "../ast/index.js";
import type { LabeledPropertyGraph } from "./LabeledPropertyGraph.js";

export function transformAstToLabeledPropertyGraph(
  ast: ast.Ast,
): LabeledPropertyGraph {
  const nodes: LabeledPropertyGraph.Node[] = [];
  const relationships: LabeledPropertyGraph.Relationship[] = [];

  for (const namedObjectType of ast.namedObjectTypes) {
    const id = typeId(namedObjectType);
    const properties: LabeledPropertyGraph.Node["properties"] = {
      name: { type: "string", value: typeName(namedObjectType) },
    };

    for (const namedObjectTypeProperty of namedObjectType.properties) {
      let itemType: ast.Type;

      switch (namedObjectTypeProperty.type.kind) {
        case "DefaultValue":
        case "List":
        case "Option":
        case "Set":
          itemType = namedObjectTypeProperty.type.itemType;
          break;
        case "LazyObject":
          itemType = namedObjectTypeProperty.type.resolveType;
          break;
        case "LazyObjectOption":
        case "LazyObjectSet":
          itemType = namedObjectTypeProperty.type.resolveType.itemType;
          break;
        default:
          itemType = namedObjectTypeProperty.type;
          break;
      }

      switch (itemType.kind) {
        case "Intersection":
        case "Object":
        case "Union":
          if (itemType.name.isJust()) {
            relationships.push({
              id: namedObjectTypeProperty.shapeIdentifier.toString(),
              label: Maybe.of(namedObjectTypeProperty.name),
              properties: {},
              sourceNodeId: id,
              targetNodeId: typeId(itemType),
            });
          }
          break;
        default:
          properties[namedObjectTypeProperty.name] = {
            type: "string",
            value: namedObjectTypeProperty.toString(),
          };
      }
    }

    nodes.push({
      id,
      label: typeName(namedObjectType),
      properties: properties,
    });
  }

  for (const namedUnionType of ast.namedUnionTypes) {
    nodes.push({
      id: typeId(namedUnionType),
      label: typeName(namedUnionType),
      properties: {},
    });
  }

  return {
    nodes,
    relationships,
  };
}

function typeId(type: {
  name: Maybe<string>;
  shapeIdentifier: BlankNode | NamedNode;
}) {
  return type.name.orDefault(type.shapeIdentifier.toString());
}

function typeName(type: {
  name: Maybe<string>;
  shapeIdentifier: BlankNode | NamedNode;
}) {
  return type.name.orDefault(type.shapeIdentifier.toString());
}
