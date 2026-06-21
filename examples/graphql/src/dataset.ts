import datasetFactory from "@rdfjs/dataset";
import dataFactory from "@rdfx/data-factory";
import { ResourceSet } from "@rdfx/resource";
import {
  DiscriminatedUnionMember1,
  DiscriminatedUnionMember2,
  LazyObject,
  RootObject,
} from "./graphql.shaclmate.js";

export const dataset = datasetFactory.dataset();
const resourceSet = new ResourceSet({
  dataFactory,
  dataset,
});
for (let i = 0; i < 4; i++) {
  const lazyObject = LazyObject.createUnsafe({
    $identifier: dataFactory.namedNode(
      `http://example.com/rootObject${i}/lazyObject`,
    ),
    optionalNumberProperty: 2,
    optionalStringProperty: "optional string (lazy)",
    requiredStringProperty: "required string (lazy)",
  });
  LazyObject.toRdfResource(lazyObject, { resourceSet });

  RootObject.toRdfResource(
    RootObject.createUnsafe({
      $identifier: dataFactory.namedNode(`http://example.com/rootObject${i}`),
      lazyObjectSetProperty: [lazyObject],
      optionalLazyProperty: lazyObject,
      optionalObjectProperty: {
        $identifier: dataFactory.namedNode(
          `http://example.com/rootObject${i}/nestedObject`,
        ),
        requiredStringProperty: "required string (nested)",
      },
      optionalStringProperty: "optional string (root)",
      requiredStringProperty: "required string (root)",
    }),
    { resourceSet },
  );

  if (i % 2 === 0) {
    DiscriminatedUnionMember1.toRdfResource(
      DiscriminatedUnionMember1.createUnsafe({
        $identifier: dataFactory.namedNode(
          `http://example.com/discriminatedUnion${i}`,
        ),
        optionalNumberProperty: 1,
      }),
      { resourceSet },
    );
  } else {
    DiscriminatedUnionMember2.toRdfResource(
      DiscriminatedUnionMember2.createUnsafe({
        $identifier: dataFactory.namedNode(
          `http://example.com/discriminatedUnion${i}`,
        ),
        optionalStringProperty: "test",
      }),
      { resourceSet },
    );
  }
}
