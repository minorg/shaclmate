import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ConversionFunction: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}ConversionFunction`,
    code`\
type ${syntheticNamePrefix}ConversionFunction<SourceT, TargetT, DefaultNamespaceT extends ${imports.NamespaceBuilder} = ${imports.NamespaceBuilder}> = (source: SourceT, defaultNamespace?: DefaultNamespaceT) => ${imports.Either}<Error, TargetT>;`,
  );
