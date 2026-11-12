import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_LazySchema: SnippetFactory = ({ syntheticNamePrefix }) =>
  conditionalOutput(
    `${syntheticNamePrefix}LazySchema`,
    code`\
interface ${syntheticNamePrefix}LazySchema<PartialSchemaT>{
  readonly kind: "Lazy" | "LazyOption" | "LazySet";
  readonly partialType: PartialSchemaT;
}`,
  );
