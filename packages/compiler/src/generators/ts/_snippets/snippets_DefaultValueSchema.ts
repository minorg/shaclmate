import { code, conditionalOutput } from "ts-poet";
import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_DefaultValueSchema = conditionalOutput(
  `${syntheticNamePrefix}DefaultValueSchema`,
  code`type ${syntheticNamePrefix}DefaultValueSchema<ItemSchemaT> = { readonly defaultValue: ${imports.Literal} | ${imports.NamedNode}; readonly item: ItemSchemaT; }`,
);
