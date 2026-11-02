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

      for (const namedStructTypeField of namedStructType.fields) {
        if (namedStructTypeField.kind !== "Shacl") {
          continue;
        }

        let itemType: ast.Type;

        switch (namedStructTypeField.type.kind) {
          case "DefaultValue":
          case "List":
          case "Option":
          case "Set":
            itemType = namedStructTypeField.type.itemType;
            break;
          case "Lazy":
            itemType = namedStructTypeField.type.resolveType;
            break;
          case "LazyOption":
          case "LazySet":
            itemType = namedStructTypeField.type.resolveType.itemType;
            break;
          default:
            itemType = namedStructTypeField.type;
            break;
        }

        switch (itemType.kind) {
          case "Intersection":
          case "Struct":
          case "DiscriminatedUnion":
            if (itemType.name.isJust()) {
              relationships.push({
                id: namedStructTypeField.shapeIdentifier.toString(),
                label: Maybe.of(namedStructTypeField.name),
                properties: {},
                sourceNodeId: id,
                targetNodeId: typeId(itemType),
              });
            }
            break;
          default:
            properties[namedStructTypeField.name] = {
              type: "string",
              value: namedStructTypeField.toString(),
            };
        }
      }

      nodes.push({
        id,
        label: typeName(namedStructType),
        properties: properties,
      });
    } else if (namedType.kind === "DiscriminatedUnion") {
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
