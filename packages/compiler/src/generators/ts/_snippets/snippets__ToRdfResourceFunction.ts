import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets__ToRdfResourceFunction: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}_ToRdfResourceFunction`,
    code`\
export type ${syntheticNamePrefix}_ToRdfResourceFunction<IdentifierT extends ${imports.Resource}.Identifier, ObjectT extends { ${syntheticNamePrefix}identifier: () => IdentifierT }> = (
  parameters: {
    graph: Exclude<${imports.Quad_Graph}, ${imports.Variable}> | undefined;
    ignoreRdfType: boolean;
    object: ObjectT
    resource: ${imports.Resource}<IdentifierT>;
    resourceSet: ${imports.ResourceSet};
  }
) => void;`,
  );
