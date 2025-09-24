import { Maybe } from "purify-ts";
import { describe, it } from "vitest";
import "./harnesses.js"; // Must be imported before kitchenSink
import * as kitchenSink from "@shaclmate/kitchen-sink-example";

describe("mutable", () => {
  it("mutable list", ({ expect }) => {
    const instance = new kitchenSink.MutablePropertiesClass({
      mutableListProperty: ["test1", "test2"],
    });
    expect(instance.mutableListProperty.unsafeCoerce()).toStrictEqual([
      "test1",
      "test2",
    ]);
    expect(instance.$identifier.value).toStrictEqual(
      "urn:shaclmate:MutablePropertiesClass:4f980b6f9baa6965f760d0bf2b2ccbee483032e5df01d77bbd9e25f7517a06b9",
    );
    instance.mutableListProperty.unsafeCoerce().push("test3");
    // Hash-based identifier should change when the property does
    expect(instance.$identifier.value).toStrictEqual(
      "urn:shaclmate:MutablePropertiesClass:0708b4ca464c40390706888030555d860e4a0d2bc6c487392c1655b082131629",
    );
  });

  it("mutable property", ({ expect }) => {
    const instance = new kitchenSink.MutablePropertiesClass({
      mutableStringProperty: "test",
    });
    expect(instance.mutableStringProperty.unsafeCoerce()).toStrictEqual("test");
    expect(instance.$identifier.value).toStrictEqual(
      "urn:shaclmate:MutablePropertiesClass:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    );
    instance.mutableStringProperty = Maybe.of("test2");
    // Hash-based identifier should change when the property does
    expect(instance.$identifier.value).toStrictEqual(
      "urn:shaclmate:MutablePropertiesClass:60303ae22b998861bce3b28f33eec1be758a213c86c93c076dbe9f558c11c752",
    );
  });

  it("mutable set", ({ expect }) => {
    const instance = new kitchenSink.MutablePropertiesClass({
      mutableSetProperty: ["test1", "test2"],
    });
    expect(instance.mutableSetProperty).toStrictEqual(["test1", "test2"]);
    expect(instance.$identifier.value).toStrictEqual(
      "urn:shaclmate:MutablePropertiesClass:4f980b6f9baa6965f760d0bf2b2ccbee483032e5df01d77bbd9e25f7517a06b9",
    );
    instance.mutableSetProperty.push("test3");
    // Hash-based identifier should change when the property does
    expect(instance.$identifier.value).toStrictEqual(
      "urn:shaclmate:MutablePropertiesClass:0708b4ca464c40390706888030555d860e4a0d2bc6c487392c1655b082131629",
    );
  });
});
