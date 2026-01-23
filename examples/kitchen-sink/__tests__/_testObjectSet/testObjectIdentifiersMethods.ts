import type * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { describe, it } from "vitest";
import { data } from "./data.js";

export function testObjectIdentifiersMethods(
  createObjectSet: (
    ...instances: kitchenSink.$Object[]
  ) => kitchenSink.$ObjectSet,
) {
  describe("object identifiers methods", () => {
    it("no options", async ({ expect }) => {
      const objectSet = createObjectSet(...data.concreteChildClasses);
      expect(
        (await objectSet.concreteChildClassIdentifiers())
          .unsafeCoerce()
          .map((identifier) => identifier.value),
      ).toStrictEqual(
        data.concreteChildClasses.map((object) => object.$identifier.value),
      );
    });

    it("limit 1", async ({ expect }) => {
      const objectSet = createObjectSet(...data.concreteChildClasses);
      expect(
        (await objectSet.concreteChildClassIdentifiers({ limit: 1 }))
          .unsafeCoerce()
          .map((identifier) => identifier.value),
      ).toStrictEqual([data.concreteChildClasses[0].$identifier.value]);
    });

    it("offset 1", async ({ expect }) => {
      const objectSet = createObjectSet(...data.concreteChildClasses);
      expect(
        (
          await objectSet.concreteChildClassIdentifiers({
            offset: 1,
          })
        )
          .unsafeCoerce()
          .map((identifier) => identifier.value),
      ).toStrictEqual(
        data.concreteChildClasses
          .slice(1)
          .map((object) => object.$identifier.value),
      );
    });

    it("limit 2 offset 1", async ({ expect }) => {
      const objectSet = createObjectSet(...data.concreteChildClasses);
      expect(
        (
          await objectSet.concreteChildClassIdentifiers({
            limit: 2,
            offset: 1,
          })
        )
          .unsafeCoerce()
          .map((identifier) => identifier.value)
          .sort(),
      ).toStrictEqual([
        data.concreteChildClasses[1].$identifier.value,
        data.concreteChildClasses[2].$identifier.value,
      ]);
    });

    describe("union", () => {
      it("class union", async ({ expect }) => {
        const objectSet = createObjectSet(...data.classUnions);
        expect(
          new Set(
            (await objectSet.classUnionIdentifiers())
              .unsafeCoerce()
              .map((identifier) => identifier.value),
          ),
        ).toStrictEqual(
          new Set(data.classUnions.map((object) => object.$identifier.value)),
        );
      });

      it("class union limit 1", async ({ expect }) => {
        const objectSet = createObjectSet(...data.classUnions);
        expect(
          (await objectSet.classUnionIdentifiers({ limit: 1 }))
            .unsafeCoerce()
            .map((identifier) => identifier.value),
        ).toStrictEqual([data.classUnions[0].$identifier.value]);
      });
    });
  });
}
