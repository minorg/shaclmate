import type * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { testObjectFilters } from "./_testObjectSet/testObjectFilters.js";
import { testObjectIdentifiersMethods } from "./_testObjectSet/testObjectIdentifiersMethods.js";
import { testObjectMethods } from "./_testObjectSet/testObjectMethods.js";
import { testObjectsCountMethods } from "./_testObjectSet/testObjectsCountMethods.js";
import { testObjectsMethods } from "./_testObjectSet/testObjectsMethods.js";

export function testObjectSet(
  createObjectSet: (
    ...instances: kitchenSink.$Object[]
  ) => kitchenSink.$ObjectSet,
) {
  testObjectFilters(createObjectSet);
  testObjectIdentifiersMethods(createObjectSet);
  testObjectMethods(createObjectSet);
  testObjectsCountMethods(createObjectSet);
  testObjectsMethods(createObjectSet);
}
