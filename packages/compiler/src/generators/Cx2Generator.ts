import type { Ast } from "../ast/Ast.js";
import type { Generator } from "./Generator.js";
import type { LabeledPropertyGraph } from "./LabeledPropertyGraph.js";
import { transformAstToLabeledPropertyGraph } from "./transformAstToLabeledPropertyGraph.js";

type AttributeDeclaration = { d: string };
type Id = number;

export class Cx2Generator implements Generator {
  private readonly visualProperties: Record<string, unknown> | undefined;

  constructor(options?: { visualProperties?: Record<string, unknown> }) {
    this.visualProperties = options?.visualProperties;
  }

  generate(ast: Ast): string {
    const labeledPropertyGraph = transformAstToLabeledPropertyGraph(ast);

    const edgeAttributeDeclarations: Record<string, AttributeDeclaration> = {
      interaction: { d: "string" },
    };
    const edgeIdMap: Record<LabeledPropertyGraph.Id, Id> = {};
    const edges: { id: Id; s: Id; t: Id; v: Record<string, unknown> }[] = [];
    const nodeAttributeDeclarations: Record<string, AttributeDeclaration> = {
      name: { d: "string" },
    };
    const nodeIdMap: Record<LabeledPropertyGraph.Id, Id> = {};
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
      let id = nodeIdMap[lpgNode.id];
      if (id === undefined) {
        id = Object.keys(nodeIdMap).length + 1;
        nodeIdMap[lpgNode.id] = id;
      }

      const v: Record<string, unknown> = {
        name: lpgNode.label,
      };
      for (const [lpgNodePropertyName, lpgNodePropertyValue] of Object.entries(
        lpgNode.properties,
      )) {
        if (lpgNodePropertyName === "name") {
          continue;
        }

        if (!nodeAttributeDeclarations[lpgNodePropertyName]) {
          nodeAttributeDeclarations[lpgNodePropertyName] =
            attributeDeclaration(lpgNodePropertyValue);
        }

        v[lpgNodePropertyName] = lpgNodePropertyValue.value;
      }

      nodes.push({
        id,
        v,
      });
    }

    for (const lpgRelationship of labeledPropertyGraph.relationships) {
      let id: Id = edgeIdMap[lpgRelationship.id];
      if (id === undefined) {
        id = Object.keys(edgeIdMap).length + 1;
        edgeIdMap[lpgRelationship.id] = id;
      }

      edges.push({
        id,
        s: nodeIdMap[lpgRelationship.sourceNodeId]!,
        t: nodeIdMap[lpgRelationship.targetNodeId]!,
        v: lpgRelationship.label
          .map<Record<string, unknown>>((label) => ({ interaction: label }))
          .orDefault({}),
      });
    }

    let visualProperties: any = this.visualProperties ?? {};
    visualProperties = {
      ...visualProperties,
      default: {
        edge: {
          ...visualProperties?.default?.edge,
          EDGE_LABEL: "interaction",
        },
      },
      edgeMapping: {
        ...visualProperties?.edgeMapping,
        EDGE_LABEL: {
          type: "PASSTHROUGH",
          definition: {
            attribute: "interaction",
            type: "string",
          },
        },
      },
    };

    return JSON.stringify(
      [
        {
          CXVersion: "2.0",
          hasFragments: false,
        },

        {
          metaData: [
            {
              elementCount: edges.length,
              name: "edges",
            },
            {
              elementCount: nodes.length,
              name: "nodes",
            },
          ],
        },

        {
          attributeDeclarations: [
            {
              edges: edgeAttributeDeclarations,
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
          visualProperties: [visualProperties],
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
