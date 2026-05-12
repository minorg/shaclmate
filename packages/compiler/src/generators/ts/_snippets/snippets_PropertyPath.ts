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
export type ${syntheticNamePrefix}PropertyPath = ${this.imports.RdfxResourcePropertyPath};

export namespace ${syntheticNamePrefix}PropertyPath {
  export type $Filter = object;

  export function $filter(_filter: $Filter, _value: ${syntheticNamePrefix}PropertyPath): boolean {
    return true;
  }

  export const ${syntheticNamePrefix}fromRdfResource: ${this.snippets.FromRdfResourceFunction}<${syntheticNamePrefix}PropertyPath> = ${this.imports.RdfxResourcePropertyPath}.fromResource;

  export const $fromRdfResourceValues: ${this.snippets.FromRdfResourceValuesFunction}<${syntheticNamePrefix}PropertyPath> = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) => ${syntheticNamePrefix}fromRdfResource(resource, options)),
      ),
    );

  export const $schema: Readonly<object> = {};

  export const ${syntheticNamePrefix}toRdfResource: ${this.snippets.ToRdfResourceFunction}<${syntheticNamePrefix}PropertyPath> = ${this.imports.RdfxResourcePropertyPath}.toResource;

  export const ${syntheticNamePrefix}toString = ${this.imports.RdfxResourcePropertyPath}.toString;
}`,
  );
