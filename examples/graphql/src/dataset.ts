import N3 from "n3";
import { MutableResourceSet } from "rdfjs-resource";
import { ConcreteChild, ConcreteParent, Nested } from "./generated.js";

export const dataset = new N3.Store();
const resourceSet = new MutableResourceSet({
  dataFactory: N3.DataFactory,
  dataset,
});
for (let i = 0; i < 4; i++) {
  new ConcreteChild({
    identifier: N3.DataFactory.namedNode(
      `http://example.com/concreteChild${i}`,
    ),
    childStringProperty: "child string property",
    optionalNestedObjectProperty: new Nested({
      identifier: N3.DataFactory.namedNode(
        `http://example.com/concreteChild${i}/nested`,
      ),
      optionalNumberProperty: 2,
      optionalStringProperty: "optional string (nested)",
      requiredStringProperty: "required string (nested)",
    }),
    optionalStringProperty: "optional string (concrete child)",
    parentStringProperty: "parent string (concrete child)",
    requiredStringProperty: "required string (concrete child)",
  }).toRdf({ resourceSet });

  new ConcreteParent({
    identifier: N3.DataFactory.namedNode(
      `http://example.com/concreteParent${i}`,
    ),
    parentStringProperty: "parent string",
  }).toRdf({ resourceSet });
}
