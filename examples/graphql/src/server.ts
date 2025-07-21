import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import N3 from "n3";
import { MutableResourceSet } from "rdfjs-resource";
import {
  $RdfjsDatasetObjectSet,
  ConcreteChild,
  ConcreteParent,
  Nested,
  graphqlSchema,
} from "./generated.js";

const dataset = new N3.Store();
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

const yoga = createYoga({
  context: {
    objectSet: new $RdfjsDatasetObjectSet({ dataset }),
  },
  schema: graphqlSchema,
});

const server = createServer(yoga);

const port = 3000;
server.listen(port);
