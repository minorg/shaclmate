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

  it("optional lazy object", async ({ expect }) => {
    const result = await execute(
      `query { child(identifier: "<http://example.com/child0>") { _identifier optionalLazyObjectProperty { _identifier } } }`,
    );
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      child: {
        _identifier: "<http://example.com/child0>",
        optionalLazyObjectProperty: {
          _identifier: "<http://example.com/child0/lazy>",
        },
      },
    });
  });

  it("lazy object set", async ({ expect }) => {
    const result = await execute(
      `query { child(identifier: "<http://example.com/child0>") { _identifier lazyObjectSetProperty { _identifier } } }`,
    );
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      child: {
        _identifier: "<http://example.com/child0>",
        lazyObjectSetProperty: [
          {
            _identifier: "<http://example.com/child0/lazy>",
          },
        ],
      },
    });
  });

  it("lazy object set (limit and offset)", async ({ expect }) => {
    const result = await execute(
      `query { child(identifier: "<http://example.com/child0>") { _identifier lazyObjectSetProperty(limit: 1, offset: 1) { _identifier } } }`,
    );
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      child: {
        _identifier: "<http://example.com/child0>",
        lazyObjectSetProperty: [],
      },
    });
  });

  it("nested object", async ({ expect }) => {
    const result = await execute(
      `query { child(identifier: "<http://example.com/child0>") { _identifier optionalObjectProperty { _identifier } } }`,
    );
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      child: {
        _identifier: "<http://example.com/child0>",
        optionalObjectProperty: {
          _identifier: "<http://example.com/child0/nested>",
        },
      },
    });
  });

  it("object", async ({ expect }) => {
    const result = await execute(
      `query { child(identifier: "<http://example.com/child0>") { _identifier, childStringProperty } }`,
    );
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      child: {
        _identifier: "<http://example.com/child0>",
        childStringProperty: "child string property",
      },
    });
  });

  it("object identifiers (all)", async ({ expect }) => {
    const result = await execute("query { childIdentifiers }");
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      childIdentifiers: [...new Array(4)].map(
        (_, i) => `<http://example.com/child${i}>`,
      ),
    });
  });

  it("object identifiers (limit)", async ({ expect }) => {
    const result = await execute("query { childIdentifiers(limit: 2) }");
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      childIdentifiers: [...new Array(2)].map(
        (_, i) => `<http://example.com/child${i}>`,
      ),
    });
  });

  it("object identifiers (offset)", async ({ expect }) => {
    const result = await execute("query { childIdentifiers(offset: 1) }");
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      childIdentifiers: [...new Array(3)].map(
        (_, i) => `<http://example.com/child${i + 1}>`,
      ),
    });
  });

  it("objects (all)", async ({ expect }) => {
    const result = await execute(
      "query { children { _identifier, childStringProperty } }",
    );
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      children: [...new Array(4)].map((_, i) => ({
        _identifier: `<http://example.com/child${i}>`,
        childStringProperty: "child string property",
      })),
    });
  });

  it("objects (identifiers)", async ({ expect }) => {
    const result = await execute(
      `query { children(identifiers: [${[...new Array(2)].map((_, i) => `"<http://example.com/child${i + 1}>"`).join(", ")}]) { _identifier, childStringProperty } }`,
    );
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      children: [...new Array(2)].map((_, i) => ({
        _identifier: `<http://example.com/child${i + 1}>`,
        childStringProperty: "child string property",
      })),
    });
  });

  it("objects (limit)", async ({ expect }) => {
    const result = await execute(
      "query { children(limit: 2) { _identifier, childStringProperty } }",
    );
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      children: [...new Array(2)].map((_, i) => ({
        _identifier: `<http://example.com/child${i}>`,
        childStringProperty: "child string property",
      })),
    });
  });

  it("objects (offset)", async ({ expect }) => {
    const result = await execute(
      "query { children(offset: 1) { _identifier, childStringProperty } }",
    );
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      children: [...new Array(3)].map((_, i) => ({
        _identifier: `<http://example.com/child${i + 1}>`,
        childStringProperty: "child string property",
      })),
    });
  });

  it("objectsCount", async ({ expect }) => {
    const result = await execute("query { childrenCount }");
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      childrenCount: 4,
    });
  });

  it("union object", async ({ expect }) => {
    const result = await execute(
      `\
query {
  union(identifier: "<http://example.com/union0>") {
    ... on UnionMember1 {
      _identifier
      optionalNumberProperty
    }
    ... on UnionMember2 {
      _identifier
      optionalStringProperty
    }
  }
}`,
    );
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      union: {
        _identifier: "<http://example.com/union0>",
        optionalNumberProperty: 1,
      },
    });
  });

  it("union object identifiers (all)", async ({ expect }) => {
    const result = await execute("query { unionIdentifiers }");
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      unionIdentifiers: [...new Array(4)].map(
        (_, i) => `<http://example.com/union${i}>`,
      ),
    });
  });

  it("union objects (all)", async ({ expect }) => {
    const result = await execute(
      `\
query {
  unions {
    ... on UnionMember1 {
      _identifier
      optionalNumberProperty
    }
    ... on UnionMember2 {
      _identifier
      optionalStringProperty
    }
  }
}`,
    );
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      unions: [...new Array(4)].map((_, i) => {
        const _identifier = `<http://example.com/union${i}>`;
        if (i % 2 === 0) {
          return { _identifier, optionalNumberProperty: 1 };
        }
        return { _identifier, optionalStringProperty: "test" };
      }),
    });
  });

  it("union objectsCount", async ({ expect }) => {
    const result = await execute("query { unionsCount }");
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      unionsCount: 4,
    });
  });
});
