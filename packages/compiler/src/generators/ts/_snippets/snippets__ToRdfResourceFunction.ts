import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets__ToRdfResourceFunction: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}_ToRdfResourceFunction`,
    code`\
export type ${syntheticNamePrefix}_ToRdfResourceFunction<T> = (
  parameters: {
    graph: Exclude<${imports.Quad_Graph}, ${imports.Variable}> | undefined;
    ignoreRdfType: boolean;
    resource: ${imports.Resource};
    resourceSet: ${imports.ResourceSet};
    value: T
  }
) => void;`,
  );
