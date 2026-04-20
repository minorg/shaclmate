import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_FromRdfOptions } from "./snippets_FromRdfOptions.js";

export const snippets_FromRdfFunctionParameters = conditionalOutput(
  `${syntheticNamePrefix}FromRdfFunctionParameters`,
  code`type ${syntheticNamePrefix}FromRdfFunctionParameters = ${snippets_FromRdfOptions} & { propertyPath: ${imports.PropertyPath}; resource: ${imports.Resource}; resourceValues: ${imports.Either}<Error, ${imports.Resource}.Values>; }`,
);
