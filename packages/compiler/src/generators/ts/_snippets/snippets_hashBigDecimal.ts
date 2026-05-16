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
function ${syntheticNamePrefix}hashBigDecimal<HasherT extends ${snippets.Hasher}>(hasher: HasherT, value: ${imports.BigDecimal}): HasherT {
  hasher.update(value.toFixed());
  return hasher;
}`,
  );
