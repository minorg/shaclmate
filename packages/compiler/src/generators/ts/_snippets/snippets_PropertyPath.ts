import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_FromRdfResourceFunction } from "./snippets_FromRdfResourceFunction.js";
import { snippets_FromRdfResourceValuesFunction } from "./snippets_FromRdfResourceValuesFunction.js";
import { snippets_ToRdfResourceFunction } from "./snippets_ToRdfResourceFunction.js";

/**
 * Adapter between generated code and the rdfjs-resource PropertyPath.
 */
export const snippets_PropertyPath = conditionalOutput(
  `${syntheticNamePrefix}PropertyPath`,
  code`\
export type ${syntheticNamePrefix}PropertyPath = ${imports.RdfjsResourcePropertyPath};

export namespace ${syntheticNamePrefix}PropertyPath {
  export type $Filter = object;

  export function $filter(_filter: $Filter, _value: PropertyPath): boolean {
    return true;
  }

  export const ${syntheticNamePrefix}fromRdfResource: ${snippets_FromRdfResourceFunction}<${syntheticNamePrefix}PropertyPath> = ${imports.RdfjsResourcePropertyPath}.${syntheticNamePrefix}fromRdf;

  export const $fromRdfResourceValues: ${snippets_FromRdfResourceValuesFunction}> = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) => ${syntheticNamePrefix}fromRdfResource(resource, options)),
      ),
    );

  export const $schema: Readonly<object> = {};

  export const ${syntheticNamePrefix}toRdfResource: ${snippets_ToRdfResourceFunction}<${syntheticNamePrefix}PropertyPath> = ${imports.RdfjsResourcePropertyPath}.${syntheticNamePrefix}toRdf;
}`,
);
