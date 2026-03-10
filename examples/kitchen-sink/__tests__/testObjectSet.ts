import type * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { testObjectCountMethods } from "./_testObjectSet/testObjectCountMethods.js";
import { testObjectFilters } from "./_testObjectSet/testObjectFilters.js";
import { testObjectIdentifiersMethods } from "./_testObjectSet/testObjectIdentifiersMethods.js";
import { testObjectMethods } from "./_testObjectSet/testObjectMethods.js";
import { testObjectsMethods } from "./_testObjectSet/testObjectsMethods.js";

export function testObjectSet(
  createObjectSet: (
    ...instances: kitchenSink.$Object[]
  ) => kitchenSink.$ObjectSet,
) {
  testObjectFilters(createObjectSet);
  testObjectIdentifiersMethods(createObjectSet);
  testObjectMethods(createObjectSet);
  testObjectCountMethods(createObjectSet);
  testObjectsMethods(createObjectSet);
}
