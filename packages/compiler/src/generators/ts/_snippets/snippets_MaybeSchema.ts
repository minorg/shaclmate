import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_MaybeSchema: SnippetFactory = ({ syntheticNamePrefix }) =>
  conditionalOutput(
    `${syntheticNamePrefix}MaybeSchema`,
    code`\
interface ${syntheticNamePrefix}MaybeSchema<ItemSchemaT>{
  readonly item: () => ItemSchemaT;
  readonly kind: "Maybe";
}`,
  );
