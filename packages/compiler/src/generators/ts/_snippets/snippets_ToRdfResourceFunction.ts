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
    (value: T, options?: { graph?: Exclude<${this.imports.Quad_Graph}, ${this.imports.Variable}>; ignoreRdfType?: boolean; resourceSet?: ${this.imports.ResourceSet}; }) => ${this.imports.Resource};`,
  );
