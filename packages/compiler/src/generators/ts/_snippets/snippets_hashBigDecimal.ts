import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_hashBigDecimal: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}hashBigDecimal`,
    code`\
const ${syntheticNamePrefix}hashBigDecimal: ${snippets.HashFunction}<${imports.BigDecimal}> = (hasher, value) => {
  hasher.update(value.toFixed());
}`,
  );
