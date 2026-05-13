import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ToRdfResourceFunction: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}ToRdfResourceFunction`,
    code`\
export type ${syntheticNamePrefix}ToRdfResourceFunction<ObjectT, IdentifierT extends ${imports.Resource}.Identifier = ${imports.Resource}.Identifier> = (
  object: ObjectT,
  options?: {
    graph?: Exclude<${imports.Quad_Graph}, ${imports.Variable}>;
    ignoreRdfType?: boolean;
    resourceSet?: ${imports.ResourceSet};
  }
) => ${imports.Resource}<IdentifierT>;`,
  );
