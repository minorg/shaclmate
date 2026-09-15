import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToBigInt: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToBigInt`,
    code`\
const ${syntheticNamePrefix}convertToBigInt: ${snippets.ConversionFunction}<bigint | number | string, bigint> = (value) =>
  ${imports.Either}.encase(() => BigInt(value));`,
  );
