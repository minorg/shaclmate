import { Maybe } from "purify-ts";
import { imports } from "../imports.js";
import type { ObjectType } from "../ObjectType.js";
import { snippets } from "../snippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_fromRdfFunctionDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.features.has("rdf")) {
    return Maybe.empty();
  }

  if (this.abstract) {
    return Maybe.empty();
  }

  const statements: Code[] = [
    code`let { context, ignoreRdfType = false, objectSet, preferredLanguages } = (options ?? {});`,
    code`if (!objectSet) { objectSet = new ${syntheticNamePrefix}RdfjsDatasetObjectSet(resource.dataset); }`,
  ];

  let propertiesFromRdfExpression = code`${this.staticModuleName}.${syntheticNamePrefix}propertiesFromRdf({ context, ignoreRdfType, objectSet, preferredLanguages, resource })`;
  if (this.declarationType === "class") {
    propertiesFromRdfExpression = code`${propertiesFromRdfExpression}.map(properties => new ${this.name}(properties))`;
  }
  statements.push(code`return ${propertiesFromRdfExpression};`);

  return Maybe.of(code`\
export function ${syntheticNamePrefix}fromRdf(resource: ${imports.Resource}, options?: ${snippets.FromRdfOptions}): ${imports.Either}<Error, ${this.name}> {
${joinCode(statements)}
}`);
}
