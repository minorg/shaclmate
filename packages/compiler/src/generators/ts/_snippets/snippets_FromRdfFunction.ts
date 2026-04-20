import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_FromRdfFunctionParameters } from "./snippets_FromRdfFunctionParameters.js";

export const snippets_FromRdfFunction = conditionalOutput(
  `${syntheticNamePrefix}FromRdfFunction`,
  code`type ${syntheticNamePrefix}FromRdfFunction<T> = (parameters: ${snippets_FromRdfFunctionParameters}) => ${imports.Either}<Error, ${imports.Resource}.Values<T>>;`,
);
