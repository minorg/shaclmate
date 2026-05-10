import datasetFactory from "@rdfjs/dataset";
import dataFactory from "@rdfx/data-factory";
import { ResourceSet } from "@rdfx/resource";
import {
  Child,
  Nested,
  ParentStatic,
  UnionMember1,
  UnionMember2,
} from "./generated.js";

export const dataset = datasetFactory.dataset();
const resourceSet = new ResourceSet({
  dataFactory,
  dataset,
});
for (let i = 0; i < 4; i++) {
  const lazyObject = Nested.$create({
    $identifier: dataFactory.namedNode(`http://example.com/child${i}/lazy`),
    optionalNumberProperty: 2,
    optionalStringProperty: "optional string (nested)",
    requiredStringProperty: "required string (nested)",
  });
  Nested.$toRdfResource(lazyObject, { resourceSet });

  Child.$toRdfResource(
    Child.$create({
      $identifier: dataFactory.namedNode(`http://example.com/child${i}`),
      childStringProperty: "child string property",
      lazyObjectSetProperty: [lazyObject],
      optionalLazyObjectProperty: lazyObject,
      optionalObjectProperty: Nested.$create({
        $identifier: dataFactory.namedNode(
          `http://example.com/child${i}/nested`,
        ),
        optionalNumberProperty: 2,
        optionalStringProperty: "optional string (nested)",
        requiredStringProperty: "required string (nested)",
      }),
      optionalStringProperty: "optional string (concrete child)",
      parentStringProperty: "parent string (concrete child)",
      requiredStringProperty: "required string (concrete child)",
    }),
    { resourceSet },
  );

  ParentStatic.$toRdfResource(
    ParentStatic.$create({
      $identifier: dataFactory.namedNode(`http://example.com/parent${i}`),
      parentStringProperty: "parent string",
    }),
    { resourceSet },
  );

  if (i % 2 === 0) {
    UnionMember1.$toRdfResource(
      UnionMember1.$create({
        $identifier: dataFactory.namedNode(`http://example.com/union${i}`),
        optionalNumberProperty: 1,
      }),
      { resourceSet },
    );
  } else {
    UnionMember2.$toRdfResource(
      UnionMember2.$create({
        $identifier: dataFactory.namedNode(`http://example.com/union${i}`),
        optionalStringProperty: "test",
      }),
      { resourceSet },
    );
  }
}
