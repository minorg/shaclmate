import { describe, it } from "vitest";
import * as kitchenSink from "../src/index.js";
import "@rdfx/testing";
import dataFactory from "@rdfx/data-factory";
import { schema } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";

describe("create", () => {
  it("default values", ({ expect }) => {
    const instance = kitchenSink.DefaultValuesStruct.createUnsafe();
    expect(instance.falseBooleanDefaultValue).toStrictEqual(false);
    expect(instance.dateTimeDefaultValue.getTime()).toStrictEqual(
      1523268000000,
    );
    expect(instance.numberDefaultValue).toStrictEqual(0);
    expect(instance.stringDefaultValue).toStrictEqual("");
    expect(instance.trueBooleanDefaultValue).toStrictEqual(true);
  });
});
