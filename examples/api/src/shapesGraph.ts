import namespace from "@rdfjs/namespace";
import { ShapesGraph } from "@shaclmate/compiler";

const builder = ShapesGraph.builder();
const ex = namespace("http://example.com");

const _ExampleNodeShape = builder.nodeShape({
  $identifier: ex("ExampleNodeShape"),
  properties: [
    builder.propertyShape({
      $identifier: ex("ExampleNodeShape-stringProperty"),
      datatype: xsd.string,
      maxCount: 1,
      minCount: 1,
    }).$identifier,
  ],
});

export const shapesGraph = builder.build();
