import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_CollectionSchema = conditionalOutput(
  `${syntheticNamePrefix}CollectionSchema`,
  code`type ${syntheticNamePrefix}CollectionSchema<ItemSchemaT> = { readonly item: ItemSchemaT; readonly minCount: number; }`,
);
