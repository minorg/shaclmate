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
  syntheticNamePrefix,
}) => {
  const companionDeclarations: Code[] = [];

  if (configuration.features.has("Object.equals")) {
    companionDeclarations.push(code`\
export function equals(left: ${syntheticNamePrefix}PropertyPath, right: ${syntheticNamePrefix}PropertyPath): ${syntheticNamePrefix}EqualsResult {
  return ${syntheticNamePrefix}EqualsResult.fromBooleanEqualsResult(left, right, ${imports.RdfxResourcePropertyPath}.equals(left, right));
}`);
  }

  if (configuration.features.has("Object.filter")) {
    companionDeclarations.push(
      code`export type Filter = object`,
      code`\
export function filter(_filter: Filter, _value: ${syntheticNamePrefix}PropertyPath): boolean {
  return true;
}`,
    );
  }

  if (configuration.features.has("Object.fromRdf")) {
    companionDeclarations.push(
      code`\
export const fromRdfResource: ${syntheticNamePrefix}FromRdfResourceFunction<${syntheticNamePrefix}PropertyPath> = ${imports.RdfxResourcePropertyPath}.fromResource;`,
      code`\
export const fromRdfResourceValues: ${syntheticNamePrefix}FromRdfResourceValuesFunction<${syntheticNamePrefix}PropertyPath, object> = (values, options) =>
  values.chainMap((value) =>
    value
      .toResource()
      .chain((resource) => fromRdfResource(resource, options)),
  );`,
    );
  }

  if (configuration.features.has("Object.schema")) {
    companionDeclarations.push(
      code`export const schema: Readonly<object> = {};`,
      code`export type Schema = typeof schema;`,
    );
  }

  if (configuration.features.has("Object.toRdf")) {
    companionDeclarations.push(code`\
export const toRdfResource: ${syntheticNamePrefix}ToRdfResourceFunction<${imports.Resource}.Identifier, ${syntheticNamePrefix}PropertyPath> = ${imports.RdfxResourcePropertyPath}.toResource;`);

    companionDeclarations.push(code`
export const toRdfResourceValues: ${syntheticNamePrefix}ToRdfResourceValuesFunction<${syntheticNamePrefix}PropertyPath, ${imports.Resource}.Identifier> = (
  value,
  options,
) => [toRdfResource(value, { graph: options.graph, resourceSet: options.resourceSet }).identifier];`);
  }

  if (configuration.features.has("Object.toString")) {
    companionDeclarations.push(
      code`export const ${syntheticNamePrefix}toString = ${imports.RdfxResourcePropertyPath}.toString;`,
    );
  }

  return conditionalOutput(
    `${syntheticNamePrefix}PropertyPath`,
    code`\
export type ${syntheticNamePrefix}PropertyPath = ${imports.RdfxResourcePropertyPath};

export namespace ${syntheticNamePrefix}PropertyPath {
${joinCode(companionDeclarations, { on: "\n\n" })}
}`,
  );
};
