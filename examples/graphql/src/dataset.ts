import dataFactory from "@rdfjs/data-model";
import datasetFactory from "@rdfjs/dataset";
import { ResourceSet } from "rdfjs-resource";
import {
  Child,
  Nested,
  Parent,
  UnionMember1,
  UnionMember2,
} from "./generated.js";

export const dataset = datasetFactory.dataset();
const resourceSet = new ResourceSet(dataset, {
  dataFactory,
});
for (let i = 0; i < 4; i++) {
  const lazyObject = new Nested({
    $identifier: dataFactory.namedNode(`http://example.com/child${i}/lazy`),
    optionalNumberProperty: 2,
    optionalStringProperty: "optional string (nested)",
    requiredStringProperty: "required string (nested)",
  });
  lazyObject.$toRdf({ resourceSet });

  new Child({
    $identifier: dataFactory.namedNode(`http://example.com/child${i}`),
    childStringProperty: "child string property",
    lazyObjectSetProperty: [lazyObject],
    optionalLazyObjectProperty: lazyObject,
    optionalObjectProperty: new Nested({
      $identifier: dataFactory.namedNode(`http://example.com/child${i}/nested`),
      optionalNumberProperty: 2,
      optionalStringProperty: "optional string (nested)",
      requiredStringProperty: "required string (nested)",
    }),
    optionalStringProperty: "optional string (concrete child)",
    parentStringProperty: "parent string (concrete child)",
    requiredStringProperty: "required string (concrete child)",
  }).$toRdf({ resourceSet });

  new Parent({
    $identifier: dataFactory.namedNode(`http://example.com/parent${i}`),
    parentStringProperty: "parent string",
  }).$toRdf({ resourceSet });

  if (i % 2 === 0) {
    new UnionMember1({
      $identifier: dataFactory.namedNode(`http://example.com/union${i}`),
      optionalNumberProperty: 1,
    }).$toRdf({ resourceSet });
  } else {
    new UnionMember2({
      $identifier: dataFactory.namedNode(`http://example.com/union${i}`),
      optionalStringProperty: "test",
    }).$toRdf({ resourceSet });
  }
}
