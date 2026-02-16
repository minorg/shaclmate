import { code, conditionalOutput } from "ts-poet";
import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_PropertiesFromRdfParameters = conditionalOutput(
  `${syntheticNamePrefix}PropertiesFromRdfParameters`,
  code`type ${syntheticNamePrefix}PropertiesFromRdfParameters = { context?: any; ignoreRdfType: boolean; objectSet: ${syntheticNamePrefix}ObjectSet; preferredLanguages?: readonly string[]; resource: ${imports.Resource}; };`,
);
