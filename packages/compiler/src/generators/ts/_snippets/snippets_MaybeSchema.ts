import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_MaybeSchema = conditionalOutput(
  `${syntheticNamePrefix}MaybeSchema`,
  code`type ${syntheticNamePrefix}MaybeSchema<ItemSchemaT> = { readonly item: ItemSchemaT }`,
);
