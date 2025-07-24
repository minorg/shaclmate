import { type ExecutionResult, graphql } from "graphql";
import { describe, it } from "vitest";
import { dataset } from "../src/dataset.js";
import { $RdfjsDatasetObjectSet, graphqlSchema } from "../src/generated.js";

describe("graphqlSchema", () => {
  const execute = async (query: string): Promise<ExecutionResult> => {
    return await graphql({
      contextValue: { objectSet: new $RdfjsDatasetObjectSet({ dataset }) },
      schema: graphqlSchema,
      source: query,
    });
  };

  it("concreteChild object", async ({ expect }) => {
    const result = await execute(
      `query { concreteChild(identifier: "<http://example.com/concreteChild0>") { identifier, childStringProperty } }`,
    );
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      concreteChild: {
        identifier: "<http://example.com/concreteChild0>",
        childStringProperty: "child string property",
      },
    });
  });

  it("concreteChild objects (all)", async ({ expect }) => {
    const result = await execute(
      "query { concreteChilds { identifier, childStringProperty } }",
    );
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      concreteChilds: [...new Array(4)].map((_, i) => ({
        identifier: `<http://example.com/concreteChild${i}>`,
        childStringProperty: "child string property",
      })),
    });
  });

  it("concreteChild objects (identifiers)", async ({ expect }) => {
    const result = await execute(
      `query { concreteChilds(identifiers: [${[...new Array(2)].map((_, i) => `"<http://example.com/concreteChild${i + 1}>"`).join(", ")}]) { identifier, childStringProperty } }`,
    );
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      concreteChilds: [...new Array(2)].map((_, i) => ({
        identifier: `<http://example.com/concreteChild${i + 1}>`,
        childStringProperty: "child string property",
      })),
    });
  });

  it("concreteChild objects (limit)", async ({ expect }) => {
    const result = await execute(
      "query { concreteChilds(limit: 2) { identifier, childStringProperty } }",
    );
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      concreteChilds: [...new Array(2)].map((_, i) => ({
        identifier: `<http://example.com/concreteChild${i}>`,
        childStringProperty: "child string property",
      })),
    });
  });

  it("concreteChild objects (offset)", async ({ expect }) => {
    const result = await execute(
      "query { concreteChilds(offset: 1) { identifier, childStringProperty } }",
    );
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      concreteChilds: [...new Array(3)].map((_, i) => ({
        identifier: `<http://example.com/concreteChild${i + 1}>`,
        childStringProperty: "child string property",
      })),
    });
  });

  it("concreteChild objectsCount", async ({ expect }) => {
    const result = await execute("query { concreteChildsCount }");
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      concreteChildsCount: 4,
    });
  });
});
