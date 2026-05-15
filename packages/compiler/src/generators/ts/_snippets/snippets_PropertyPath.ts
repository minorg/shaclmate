import type { SnippetFactory } from "../SnippetFactory.js";
import {
  type Code,
  code,
  conditionalOutput,
  joinCode,
} from "../ts-poet-wrapper.js";

/**
 * Adapter between generated code and the rdfjs-resource PropertyPath.
 */
export const snippets_PropertyPath: SnippetFactory = ({
  configuration,
  imports,
  snippets,
  syntheticNamePrefix,
}) => {
  const companionDeclarations: Code[] = [];

  if (configuration.features.has("equals")) {
    companionDeclarations.push(code`\
export function equals(left: ${syntheticNamePrefix}PropertyPath, right: ${syntheticNamePrefix}PropertyPath): ${snippets.EqualsResult} {
  return ${snippets.EqualsResult}.fromBooleanEqualsResult(left, right, ${imports.RdfxResourcePropertyPath}.equals(left, right));
}`);
  }

  companionDeclarations.push(
    code`export type Filter = object`,
    code`\
export function filter(_filter: Filter, _value: ${syntheticNamePrefix}PropertyPath): boolean {
  return true;
}`,
  );

  if (configuration.features.has("rdf")) {
    companionDeclarations.push(
      code`\
export const fromRdfResource: ${snippets.FromRdfResourceFunction}<${syntheticNamePrefix}PropertyPath> = ${imports.RdfxResourcePropertyPath}.fromResource;`,
      code`\
export const fromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<${syntheticNamePrefix}PropertyPath> = (values, options) =>
  values.chain((values) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => fromRdfResource(resource, options)),
    ),
  );`,
    );
  }

  companionDeclarations.push(code`export const schema: Readonly<object> = {}`);

  if (configuration.features.has("rdf")) {
    companionDeclarations.push(code`\
export const toRdfResource: ${snippets.ToRdfResourceFunction}<${syntheticNamePrefix}PropertyPath> = ${imports.RdfxResourcePropertyPath}.toResource;`);
  }

  companionDeclarations.push(
    code`export const ${syntheticNamePrefix}toString = ${imports.RdfxResourcePropertyPath}.toString;`,
  );

  return conditionalOutput(
    `${syntheticNamePrefix}PropertyPath`,
    code`\
export type ${syntheticNamePrefix}PropertyPath = ${imports.RdfxResourcePropertyPath};

export namespace ${syntheticNamePrefix}PropertyPath {
${joinCode(companionDeclarations, { on: "\n\n" })}
}`,
  );
};
