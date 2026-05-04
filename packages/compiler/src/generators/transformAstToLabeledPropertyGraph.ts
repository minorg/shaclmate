import type { BlankNode, NamedNode } from "@rdfjs/types";
import { Resource } from "@rdfx/resource";
import type { Maybe } from "purify-ts";
import type * as ast from "../ast/index.js";
import type { LabeledPropertyGraph } from "./LabeledPropertyGraph.js";

export function transformAstToLabeledPropertyGraph(
  ast: ast.Ast,
): LabeledPropertyGraph {
  const nodes: LabeledPropertyGraph.Node[] = [];
  const propertySchemas: LabeledPropertyGraph.PropertySchema[] = [];
  const relationships: LabeledPropertyGraph.Relationship[] = [];

  function property(
    name: LabeledPropertyGraph.PropertyName,
    value: LabeledPropertyGraph.PropertyValue,
  ): Record<
    LabeledPropertyGraph.PropertyName,
    LabeledPropertyGraph.PropertyValue
  > {
    if (
      !propertySchemas.some(
        (propertySchema) =>
          propertySchema.name === name && propertySchema.type === value.type,
      )
    ) {
      propertySchemas.push({
        name,
        type: value.type,
      });
    }

    const result: Record<
      LabeledPropertyGraph.PropertyName,
      LabeledPropertyGraph.PropertyValue
    > = {};
    result[name] = value;
    return result;
  }

  for (const namedObjectType of ast.namedObjectTypes) {
    const id = typeId(namedObjectType);
    let properties: LabeledPropertyGraph.Node["properties"] = {};

    for (const namedObjectTypeProperty of namedObjectType.properties) {
      let itemType: ast.Type;

      switch (namedObjectTypeProperty.type.kind) {
        case "DefaultValueType":
        case "ListType":
        case "OptionType":
        case "SetType":
          itemType = namedObjectTypeProperty.type.itemType;
          break;
        case "LazyObjectType":
          itemType = namedObjectTypeProperty.type.resolveType;
          break;
        case "LazyObjectOptionType":
        case "LazyObjectSetType":
          itemType = namedObjectTypeProperty.type.resolveType.itemType;
          break;
        default:
          itemType = namedObjectTypeProperty.type;
          break;
      }

      switch (itemType.kind) {
        case "IntersectionType":
        case "ObjectType":
        case "UnionType":
          if (itemType.name.isJust()) {
            relationships.push({
              id: Resource.Identifier.toString(
                namedObjectTypeProperty.shapeIdentifier,
              ),
              properties: {},
              sourceNodeId: id,
              targetNodeId: typeId(itemType),
            });
          }
          break;
        default:
          properties = {
            ...properties,
            ...property(namedObjectTypeProperty.name, {
              type: "string",
              value: JSON.stringify(namedObjectTypeProperty.type.toJSON()),
            }),
          };
      }
    }

    nodes.push({
      id,
      properties: properties,
    });
  }

  for (const namedUnionType of ast.namedUnionTypes) {
    nodes.push({
      id: typeId(namedUnionType),
      properties: {},
    });
  }

  return {
    nodes,
    propertySchemas,
    relationships,
  };
}

function typeId(type: {
  name: Maybe<string>;
  shapeIdentifier: BlankNode | NamedNode;
}) {
  return type.name.orDefault(
    Resource.Identifier.toString(type.shapeIdentifier),
  );
}
