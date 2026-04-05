import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_FromRdfOptions = conditionalOutput(
  `${syntheticNamePrefix}FromRdfOptions`,
  code`type ${syntheticNamePrefix}FromRdfOptions = { context?: unknown; graph?: Exclude<${imports.Quad_Graph}, ${imports.Variable}>; ignoreRdfType?: boolean; objectSet?: ${syntheticNamePrefix}ObjectSet; preferredLanguages?: readonly string[]; };`,
);
