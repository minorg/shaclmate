import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BigDecimal_hash: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BigDecimal.hash`,
    code`\
namespace ${syntheticNamePrefix}BigDecimal {    
  export const hash: ${snippets.HashFunction}<${imports.BigDecimal}> = (hasher, value) => {
    hasher.update(value.toFixed());
  }
}`,
  );
