import type { Ast } from "../ast/Ast.js";
import type { Generator } from "./Generator.js";
import type { LabeledPropertyGraph } from "./LabeledPropertyGraph.js";
import { transformAstToLabeledPropertyGraph } from "./transformAstToLabeledPropertyGraph.js";

type AttributeDeclaration = { d: string };
type Id = number | string;

export class Cx2Generator implements Generator {
  generate(ast: Ast): string {
    const labeledPropertyGraph = transformAstToLabeledPropertyGraph(ast);

    const edges: { id: Id; s: Id; t: Id; v: Record<string, unknown> }[] = [];
    const nodeAttributeDeclarations: Record<string, AttributeDeclaration> = {};
    const nodes: { id: Id; v: Record<string, unknown> }[] = [];

    function attributeDeclaration(
      lpgPropertyValue: LabeledPropertyGraph.PropertyValue,
    ): AttributeDeclaration {
      switch (lpgPropertyValue.type) {
        case "boolean":
        case "double":
        case "integer":
        case "long":
        case "string":
          return { d: lpgPropertyValue.type };
        case "boolean[]":
        case "double[]":
        case "integer[]":
        case "long[]":
        case "string[]":
          return {
            d: `list_of_${lpgPropertyValue.type.substring(0, lpgPropertyValue.type.length - 2)}`,
          };
      }
    }

    for (const lpgNode of labeledPropertyGraph.nodes) {
      const v: Record<string, unknown> = {};
      for (const [lpgNodePropertyName, lpgNodePropertyValue] of Object.entries(
        lpgNode.properties,
      )) {
        if (!nodeAttributeDeclarations[lpgNodePropertyName]) {
          nodeAttributeDeclarations[lpgNodePropertyName] =
            attributeDeclaration(lpgNodePropertyValue);
        }

        v[lpgNodePropertyName] = lpgNodePropertyValue.value;
      }

      nodes.push({
        id: lpgNode.id,
        v,
      });
    }

    for (const lpgRelationship of labeledPropertyGraph.relationships) {
      edges.push({
        id: lpgRelationship.id,
        s: lpgRelationship.sourceNodeId,
        t: lpgRelationship.targetNodeId,
        v: {},
      });
    }

    return JSON.stringify(
      [
        {
          CXVersion: "2.0",
          hasFragments: false,
        },

        {
          attributeDeclarations: [
            {
              nodes: nodeAttributeDeclarations,
            },
          ],
        },

        {
          nodes,
        },

        {
          edges,
        },

        {
          status: [
            {
              success: true,
            },
          ],
        },
      ],
      undefined,
      2,
    );
  }
}
