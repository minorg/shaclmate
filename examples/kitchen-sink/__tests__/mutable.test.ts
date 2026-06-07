import { Maybe } from "purify-ts";
import { describe, it } from "vitest";
import "./harnesses.js"; // Must be imported before kitchenSink
import dataFactory from "@rdfx/data-factory";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { sha256 } from "js-sha256";

function $identifier(this: kitchenSink.MutablePropertiesStruct) {
  return dataFactory.namedNode(
    `urn:shaclmate:MutablePropertiesStruct:${kitchenSink.MutablePropertiesStruct.hash(sha256.create(), { ...this, $identifier: undefined, $type: undefined })}`,
  );
}

describe("mutable", () => {
  it("mutable list", ({ expect }) => {
    const instance = kitchenSink.MutablePropertiesStruct.createUnsafe({
      $identifier,
      mutableList: ["test1", "test2"],
    });
    expect(instance.mutableList.unsafeCoerce()).toStrictEqual([
      "test1",
      "test2",
    ]);
    expect(instance.$identifier().value).toStrictEqual(
      "urn:shaclmate:MutablePropertiesStruct:4f980b6f9baa6965f760d0bf2b2ccbee483032e5df01d77bbd9e25f7517a06b9",
    );
    instance.mutableList.unsafeCoerce().push("test3");
    // Hash-based identifier should change when the property does
    expect(instance.$identifier().value).toStrictEqual(
      "urn:shaclmate:MutablePropertiesStruct:0708b4ca464c40390706888030555d860e4a0d2bc6c487392c1655b082131629",
    );
  });

  it("mutable property", ({ expect }) => {
    const instance = kitchenSink.MutablePropertiesStruct.createUnsafe({
      $identifier,
      mutableString: "test",
    });
    expect(instance.mutableString.unsafeCoerce()).toStrictEqual("test");
    expect(instance.$identifier().value).toStrictEqual(
      "urn:shaclmate:MutablePropertiesStruct:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    );
    instance.mutableString = Maybe.of("test2");
    // Hash-based identifier should change when the property does
    expect(instance.$identifier().value).toStrictEqual(
      "urn:shaclmate:MutablePropertiesStruct:60303ae22b998861bce3b28f33eec1be758a213c86c93c076dbe9f558c11c752",
    );
  });

  it("mutable set", ({ expect }) => {
    const instance = kitchenSink.MutablePropertiesStruct.createUnsafe({
      $identifier,
      mutableSet: ["test1", "test2"],
    });
    expect(instance.mutableSet).toStrictEqual(["test1", "test2"]);
    expect(instance.$identifier().value).toStrictEqual(
      "urn:shaclmate:MutablePropertiesStruct:4f980b6f9baa6965f760d0bf2b2ccbee483032e5df01d77bbd9e25f7517a06b9",
    );
    instance.mutableSet.push("test3");
    // Hash-based identifier should change when the property does
    expect(instance.$identifier().value).toStrictEqual(
      "urn:shaclmate:MutablePropertiesStruct:0708b4ca464c40390706888030555d860e4a0d2bc6c487392c1655b082131629",
    );
  });
});
