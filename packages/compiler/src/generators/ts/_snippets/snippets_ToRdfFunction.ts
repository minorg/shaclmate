import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_ToRdfFunctionParameters } from "./snippets_ToRdfFunctionParameters.js";
import { snippets_ToRdfValue } from "./snippets_ToRdfValue.js";

export const snippets_ToRdfFunction = conditionalOutput(
  `${syntheticNamePrefix}ToRdfFunction`,
  code`type ${syntheticNamePrefix}ToRdfFunction<T> = (parameters: ${snippets_ToRdfFunctionParameters}<T>) => ${snippets_ToRdfValue};`,
);
