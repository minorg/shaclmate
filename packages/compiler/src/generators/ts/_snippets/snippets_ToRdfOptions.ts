import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ToRdfOptions = conditionalOutput(
  `${syntheticNamePrefix}ToRdfOptions`,
  code`type ${syntheticNamePrefix}ToRdfOptions = { graph?: Exclude<${imports.Quad_Graph}, ${imports.Variable}>; ignoreRdfType?: boolean; resourceSet?: ${imports.ResourceSet}; };`,
);
