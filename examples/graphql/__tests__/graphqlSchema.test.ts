import { type ExecutionResult, graphql } from "graphql";
import { describe, it } from "vitest";
import { dataset } from "../src/dataset.js";
import {
  $RdfjsDatasetObjectSet,
  graphqlSchema,
} from "../src/graphql.shaclmate.js";

describe("graphqlSchema", () => {
  const execute = async (query: string): Promise<ExecutionResult> => {
    return await graphql({
      contextValue: { objectSet: new $RdfjsDatasetObjectSet(dataset) },
      schema: graphqlSchema,
      source: query,
    });
  };

  it("optional lazy object", async ({ expect }) => {
    const result = await execute(
      `query { rootObject(identifier: "<http://example.com/rootObject0>") { _identifier optionalLazyProperty { _identifier } } }`,
    );
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      rootObject: {
        _identifier: "<http://example.com/rootObject0>",
        optionalLazyProperty: {
          _identifier: "<http://example.com/rootObject0/lazyObject>",
        },
      },
    });
  });

  it("lazy object set", async ({ expect }) => {
    const result = await execute(
      `query { rootObject(identifier: "<http://example.com/rootObject0>") { _identifier lazyObjectSetProperty { _identifier } } }`,
    );
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      rootObject: {
        _identifier: "<http://example.com/rootObject0>",
        lazyObjectSetProperty: [
          {
            _identifier: "<http://example.com/rootObject0/lazyObject>",
          },
        ],
      },
    });
  });

  it("lazy object set (limit and offset)", async ({ expect }) => {
    const result = await execute(
      `query { rootObject(identifier: "<http://example.com/rootObject0>") { _identifier lazyObjectSetProperty(limit: 1, offset: 1) { _identifier } } }`,
    );
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      rootObject: {
        _identifier: "<http://example.com/rootObject0>",
        lazyObjectSetProperty: [],
      },
    });
  });

  it("nested object", async ({ expect }) => {
    const result = await execute(
      `query { rootObject(identifier: "<http://example.com/rootObject0>") { _identifier optionalObjectProperty { _identifier } } }`,
    );
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      rootObject: {
        _identifier: "<http://example.com/rootObject0>",
        optionalObjectProperty: {
          _identifier: "<http://example.com/rootObject0/nestedObject>",
        },
      },
    });
  });

  describe("root object", () => {
    it("object", async ({ expect }) => {
      const result = await execute(
        `query { rootObject(identifier: "<http://example.com/rootObject0>") { _identifier, requiredStringProperty } }`,
      );
      expect(result.errors).toBeUndefined();
      expect(result.data).toEqual({
        rootObject: {
          _identifier: "<http://example.com/rootObject0>",
          requiredStringProperty: "required string (root)",
        },
      });
    });

    it("object identifiers (all)", async ({ expect }) => {
      const result = await execute("query { rootObjectIdentifiers }");
      expect(result.errors).toBeUndefined();
      expect(result.data).toEqual({
        rootObjectIdentifiers: [...new Array(4)].map(
          (_, i) => `<http://example.com/rootObject${i}>`,
        ),
      });
    });

    it("object identifiers (limit)", async ({ expect }) => {
      const result = await execute("query { rootObjectIdentifiers(limit: 2) }");
      expect(result.errors).toBeUndefined();
      expect(result.data).toEqual({
        rootObjectIdentifiers: [...new Array(2)].map(
          (_, i) => `<http://example.com/rootObject${i}>`,
        ),
      });
    });

    it("object identifiers (offset)", async ({ expect }) => {
      const result = await execute(
        "query { rootObjectIdentifiers(offset: 1) }",
      );
      expect(result.errors).toBeUndefined();
      expect(result.data).toEqual({
        rootObjectIdentifiers: [...new Array(3)].map(
          (_, i) => `<http://example.com/rootObject${i + 1}>`,
        ),
      });
    });

    it("objects (all)", async ({ expect }) => {
      const result = await execute(
        "query { rootObjects { _identifier, requiredStringProperty } }",
      );
      expect(result.errors).toBeUndefined();
      expect(result.data).toEqual({
        rootObjects: [...new Array(4)].map((_, i) => ({
          _identifier: `<http://example.com/rootObject${i}>`,
          requiredStringProperty: "required string (root)",
        })),
      });
    });

    it("objects (identifiers)", async ({ expect }) => {
      const result = await execute(
        `query { rootObjects(identifiers: [${[...new Array(2)].map((_, i) => `"<http://example.com/rootObject${i + 1}>"`).join(", ")}]) { _identifier, requiredStringProperty } }`,
      );
      expect(result.errors).toBeUndefined();
      expect(result.data).toEqual({
        rootObjects: [...new Array(2)].map((_, i) => ({
          _identifier: `<http://example.com/rootObject${i + 1}>`,
          requiredStringProperty: "required string (root)",
        })),
      });
    });

    it("objects (limit)", async ({ expect }) => {
      const result = await execute(
        "query { rootObjects(limit: 2) { _identifier, requiredStringProperty } }",
      );
      expect(result.errors).toBeUndefined();
      expect(result.data).toEqual({
        rootObjects: [...new Array(2)].map((_, i) => ({
          _identifier: `<http://example.com/rootObject${i}>`,
          requiredStringProperty: "required string (root)",
        })),
      });
    });

    it("objects (offset)", async ({ expect }) => {
      const result = await execute(
        "query { rootObjects(offset: 1) { _identifier, requiredStringProperty } }",
      );
      expect(result.errors).toBeUndefined();
      expect(result.data).toEqual({
        rootObjects: [...new Array(3)].map((_, i) => ({
          _identifier: `<http://example.com/rootObject${i + 1}>`,
          requiredStringProperty: "required string (root)",
        })),
      });
    });

    it("objectCount", async ({ expect }) => {
      const result = await execute("query { rootObjectCount }");
      expect(result.errors).toBeUndefined();
      expect(result.data).toEqual({
        rootObjectCount: 4,
      });
    });
  });

  describe("discriminated union", () => {
    it("object", async ({ expect }) => {
      const result = await execute(
        `\
  query {
    discriminatedUnion(identifier: "<http://example.com/discriminatedUnion0>") {
      ... on DiscriminatedUnionMember1 {
        _identifier
        optionalNumberProperty
      }
      ... on DiscriminatedUnionMember2 {
        _identifier
        optionalStringProperty
      }
    }
  }`,
      );
      expect(result.errors).toBeUndefined();
      expect(result.data).toEqual({
        discriminatedUnion: {
          _identifier: "<http://example.com/discriminatedUnion0>",
          optionalNumberProperty: 1,
        },
      });
    });

    it("object identifiers (all)", async ({ expect }) => {
      const result = await execute("query { discriminatedUnionIdentifiers }");
      expect(result.errors).toBeUndefined();
      expect(result.data).toEqual({
        discriminatedUnionIdentifiers: [...new Array(4)].map(
          (_, i) => `<http://example.com/discriminatedUnion${i}>`,
        ),
      });
    });

    it("objects (all)", async ({ expect }) => {
      const result = await execute(
        `\
query {
  discriminatedUnions {
    ... on DiscriminatedUnionMember1 {
      _identifier
      optionalNumberProperty
    }
    ... on DiscriminatedUnionMember2 {
      _identifier
      optionalStringProperty
    }
  }
}`,
      );
      expect(result.errors).toBeUndefined();
      expect(result.data).toEqual({
        discriminatedUnions: [...new Array(4)].map((_, i) => {
          const _identifier = `<http://example.com/discriminatedUnion${i}>`;
          if (i % 2 === 0) {
            return { _identifier, optionalNumberProperty: 1 };
          }
          return { _identifier, optionalStringProperty: "test" };
        }),
      });
    });

    it("objectCount", async ({ expect }) => {
      const result = await execute("query { discriminatedUnionCount }");
      expect(result.errors).toBeUndefined();
      expect(result.data).toEqual({
        discriminatedUnionCount: 4,
      });
    });
  });
});
