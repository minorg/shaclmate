import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { snippets } from "../snippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function NamedObjectType_fromRdfResourceFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.features.has("rdf")) {
    return Maybe.empty();
  }

  if (this.abstract) {
    return Maybe.empty();
  }

  const statements: Code[] = [
    code`let { context, graph, ignoreRdfType = false, objectSet, preferredLanguages } = (options ?? {});`,
    code`if (!objectSet) { objectSet = new ${syntheticNamePrefix}RdfjsDatasetObjectSet(resource.dataset); }`,
  ];

  let propertiesFromRdfExpression = code`${this.staticModuleName}.${syntheticNamePrefix}propertiesFromRdfResource(resource, { context, graph, ignoreRdfType, objectSet, preferredLanguages })`;
  if (this.declarationType === "class") {
    propertiesFromRdfExpression = code`${propertiesFromRdfExpression}.map(properties => new ${this.name}(properties))`;
  }
  statements.push(code`return ${propertiesFromRdfExpression};`);

  return Maybe.of(code`\
export const ${syntheticNamePrefix}fromRdfResource: ${snippets.FromRdfResourceFunction}<${this.name}> = (resource, options) => {
${joinCode(statements)}
};`);
}
