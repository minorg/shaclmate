import { DataFactory as dataFactory } from "n3";
import { describe, it } from "vitest";
import "./harnesses.js"; // Must be imported before kitchenSink
import * as kitchenSink from "@shaclmate/kitchen-sink-example";

describe("toString", () => {
  it("toString", ({ expect }) => {
    const instance = new kitchenSink.ConcreteChildClass({
      abstractBaseClassWithPropertiesProperty: "abc",
      concreteChildClassProperty: "child",
      concreteParentClassProperty: "parent",
      $identifier: dataFactory.namedNode("http://example.com/test"),
    });
    expect(instance.toString()).toStrictEqual(
      '{"@id":"http://example.com/test","type":"ConcreteChildClass","abstractBaseClassWithPropertiesProperty":"abc","concreteParentClassProperty":"parent","concreteChildClassProperty":"child"}',
    );
  });
});
