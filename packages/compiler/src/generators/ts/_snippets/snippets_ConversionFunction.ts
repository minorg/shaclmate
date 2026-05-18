import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ConversionFunction: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}ConversionFunction`,
    code`\
type ${syntheticNamePrefix}ConversionFunction<SourceT, TargetT> = (source: SourceT) => ${imports.Either}<Error, TargetT>;`,
  );
