import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_FromRdfOptions = conditionalOutput(
  `${syntheticNamePrefix}FromRdfOptions`,
  code`type ${syntheticNamePrefix}FromRdfOptions = { context?: any; ignoreRdfType?: boolean; objectSet?: ${syntheticNamePrefix}ObjectSet; preferredLanguages?: readonly string[]; };`,
);
