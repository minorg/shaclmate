import { AbstractShapesGraph } from "./AbstractShapesGraph.js";
import * as generated from "./shacl-ast.shaclmate.js";

const typeFunctions = {
  NodeShape: generated.NodeShape,
  Ontology: generated.Ontology,
  PropertyGroup: generated.PropertyGroup,
  PropertyShape: generated.PropertyShape,
} as const;

export class ShapesGraph extends AbstractShapesGraph<
  generated.NodeShape,
  generated.Ontology,
  generated.PropertyGroup,
  generated.PropertyShape
> {
  protected readonly typeFunctions = typeFunctions;

  static builder(): ShapesGraph.Builder {
    return new ShapesGraph.Builder();
  }
}

export namespace ShapesGraph {
  export class Builder extends AbstractShapesGraph.AbstractBuilder<
    generated.NodeShape,
    generated.Ontology,
    generated.PropertyGroup,
    generated.PropertyShape
  > {
    protected readonly typeFunctions = typeFunctions;

    build(): ShapesGraph {
      return new ShapesGraph({
        nodeShapesByIdentifier: this.nodeShapesByIdentifier,
        ontologiesByIdentifier: this.ontologiesByIdentifier,
        propertyGroupsByIdentifier: this.propertyGroupsByIdentifier,
        propertyShapesByIdentifier: this.propertyShapesByIdentifier,
      });
    }

    nodeShape(
      parameters?: Parameters<typeof generated.NodeShape.createUnsafe>[0],
    ): generated.NodeShape {
      const nodeShape = generated.NodeShape.createUnsafe(parameters);
      this.add(nodeShape);
      return nodeShape;
    }

    ontology(
      parameters?: Parameters<typeof generated.Ontology.createUnsafe>[0],
    ): generated.Ontology {
      const ontology = generated.Ontology.createUnsafe(parameters);
      this.add(ontology);
      return ontology;
    }

    propertyGroup(
      parameters?: Parameters<typeof generated.PropertyGroup.create>[0],
    ): generated.PropertyGroup {
      const propertyGroup = generated.PropertyGroup.createUnsafe(parameters);
      this.add(propertyGroup);
      return propertyGroup;
    }

    propertyShape(
      parameters: Parameters<typeof generated.PropertyShape.createUnsafe>[0],
    ): generated.PropertyShape {
      const propertyShape = generated.PropertyShape.createUnsafe(parameters);
      this.add(propertyShape);
      return propertyShape;
    }
  }
}
