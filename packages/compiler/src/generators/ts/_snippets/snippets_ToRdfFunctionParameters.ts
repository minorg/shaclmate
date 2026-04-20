import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_ToRdfOptions } from "./snippets_ToRdfOptions.js";

export const snippets_ToRdfFunctionParameters = conditionalOutput(
  `${syntheticNamePrefix}ToRdfFunctionParameters`,
  code`type ${syntheticNamePrefix}ToRdfFunctionParameters<T> = ${snippets_ToRdfOptions} & { propertyPath: ${imports.PropertyPath}; resource: ${imports.Resource}; resourceSet: ${imports.ResourceSet}; value: T; }`,
);
