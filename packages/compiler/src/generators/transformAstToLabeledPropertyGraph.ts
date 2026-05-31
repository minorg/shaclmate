import type { BlankNode, NamedNode } from "@rdfjs/types";
import { Maybe } from "purify-ts";
import type * as ast from "../ast/index.js";
import type { LabeledPropertyGraph } from "./LabeledPropertyGraph.js";

export function transformAstToLabeledPropertyGraph(
  ast: ast.Ast,
): LabeledPropertyGraph {
  const nodes: LabeledPropertyGraph.Node[] = [];
  const relationships: LabeledPropertyGraph.Relationship[] = [];

  for (const namedType of ast.namedTypes) {
    if (namedType.kind === "Struct") {
      const namedStructType = namedType;
      const id = typeId(namedType);
      const properties: LabeledPropertyGraph.Node["properties"] = {
        name: { type: "string", value: typeName(namedType) },
      };

      for (const namedObjectTypeProperty of namedStructType.fields) {
        let itemType: ast.Type;

        switch (namedObjectTypeProperty.type.kind) {
          case "DefaultValue":
          case "List":
          case "Option":
          case "Set":
            itemType = namedObjectTypeProperty.type.itemType;
            break;
          case "Lazy":
            itemType = namedObjectTypeProperty.type.resolveType;
            break;
          case "LazyOption":
          case "LazySet":
            itemType = namedObjectTypeProperty.type.resolveType.itemType;
            break;
          default:
            itemType = namedObjectTypeProperty.type;
            break;
        }

        switch (itemType.kind) {
          case "Intersection":
          case "Struct":
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
        label: typeName(namedStructType),
        properties: properties,
      });
    } else if (namedType.kind === "Union") {
      nodes.push({
        id: typeId(namedType),
        label: typeName(namedType),
        properties: {},
      });
    }
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
