import namespace from "@rdfjs/namespace";
import { NodeShape, PropertyShape, ShapesGraph } from "@shaclmate/compiler";
import { xsd } from "@tpluscode/rdf-ns-builders";

const ex = namespace("http://example.com/");

const stringPropertyShape = PropertyShape.createUnsafe({
  $identifier: ex("ExampleNodeShape-stringProperty"),
  datatype: xsd.string,
  maxCount: 1n,
  minCount: 1n,
  path: ex("stringProperty"),
});

const ExampleNodeShape1 = NodeShape.createUnsafe({
  $identifier: ex("ExampleNodeShape1"),
  shaclmateName: "ExampleNodeShape1",
  properties: [stringPropertyShape.$identifier()],
});

const nodePropertyShape = PropertyShape.createUnsafe({
  $identifier: ex("ExampleNodeShape-nodeProperty"),
  node: ExampleNodeShape1.$identifier(),
  maxCount: 1n,
  minCount: 1n,
  path: ex("nodeProperty"),
});

export const shapesGraph = ShapesGraph.fromShapes(
  ExampleNodeShape1,
  NodeShape.createUnsafe({
    $identifier: ex("ExampleNodeShape2"),
    shaclmateName: "ExampleNodeShape2",
    properties: [nodePropertyShape.$identifier()],
  }),
  nodePropertyShape,
  stringPropertyShape,
);
