import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ToRdfResourceFunction: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}ToRdfResourceFunction`,
    code`\
export type ${syntheticNamePrefix}ToRdfResourceFunction<T> =
    (value: T, options?: { graph?: Exclude<${imports.Quad_Graph}, ${imports.Variable}>; ignoreRdfType?: boolean; resourceSet?: ${imports.ResourceSet}; }) => ${imports.Resource};`,
  );
