import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

/**
 * Adapter between generated code and the rdfjs-resource PropertyPath.
 */
export const snippets_PropertyPath: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}PropertyPath`,
    code`\
export type ${syntheticNamePrefix}PropertyPath = ${imports.RdfxResourcePropertyPath};

export namespace ${syntheticNamePrefix}PropertyPath {
  export type Filter = object;

  export function filter(_filter: $Filter, _value: ${syntheticNamePrefix}PropertyPath): boolean {
    return true;
  }

  export const fromRdfResource: ${snippets.FromRdfResourceFunction}<${syntheticNamePrefix}PropertyPath> = ${imports.RdfxResourcePropertyPath}.fromResource;

  export const fromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<${syntheticNamePrefix}PropertyPath> = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) => fromRdfResource(resource, options)),
      ),
    );

  export const $schema: Readonly<object> = {};

  export const toRdfResource: ${snippets.ToRdfResourceFunction}<${syntheticNamePrefix}PropertyPath> = ${imports.RdfxResourcePropertyPath}.toResource;

  export const toString = ${imports.RdfxResourcePropertyPath}.toString;
}`,
  );
