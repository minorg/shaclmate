import { datasetFactory } from "@rdfx/collection";
import dataFactory from "@rdfx/data-factory";
import { ResourceSet } from "@rdfx/resource";
import {
  LazyObject,
  RootObject,
  UnionMember1,
  UnionMember2,
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
    UnionMember1.toRdfResource(
      UnionMember1.createUnsafe({
        $identifier: dataFactory.namedNode(`http://example.com/union${i}`),
        optionalNumberProperty: 1,
      }),
      { resourceSet },
    );
  } else {
    UnionMember2.toRdfResource(
      UnionMember2.createUnsafe({
        $identifier: dataFactory.namedNode(`http://example.com/union${i}`),
        optionalStringProperty: "test",
      }),
      { resourceSet },
    );
  }
}
