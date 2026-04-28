import namespace from "@rdfjs/namespace";
import { ShapesGraph } from "@shaclmate/compiler";
import { xsd } from "@tpluscode/rdf-ns-builders";

const builder = ShapesGraph.builder();
const ex = namespace("http://example.com/");

const ExampleNodeShape1 = builder.nodeShape({
  $identifier: ex("ExampleNodeShape1"),
  shaclmateName: "ExampleNodeShape1",
  properties: [
    builder.propertyShape({
      $identifier: ex("ExampleNodeShape-stringProperty"),
      datatype: xsd.string,
      maxCount: 1,
      minCount: 1,
      path: ex("stringProperty"),
    }).$identifier,
  ],
});

builder.nodeShape({
  $identifier: ex("ExampleNodeShape2"),
  shaclmateName: "ExampleNodeShape2",
  properties: [
    builder.propertyShape({
      $identifier: ex("ExampleNodeShape-nodeProperty"),
      nodes: [ExampleNodeShape1.$identifier],
      maxCount: 1,
      minCount: 1,
      path: ex("nodeProperty"),
    }).$identifier,
  ],
});

export const shapesGraph = builder.build();
