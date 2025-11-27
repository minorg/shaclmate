# shacl-ast

Build an Abstract Syntax Tree (AST) of [Shapes Constraint Language (SHACL)](https://www.w3.org/TR/shacl/) shapes in an [RDF/JS Dataset](https://rdf.js.org/dataset-spec/).

## Installation

    npm i @shaclmate/shacl-ast

## Usage

```ts
import { ShapesGraph } from "@shaclmate/shacl-ast";

const shapesGraph = ShapesGraphFactory.default_.createShapesGraph(testShapesGraphDataset);
for (const nodeShape of shapesGraph.nodeShapes) {
  console.info("Node shape: ", nodeShape.node.value);
  for (const propertyShape of shapesGraph.propertyShapes) {
    console.info(
      "  Property shape: ",
      propertyShape.node.value,
      propertyShape.path.value,
    );
  }
}
```
