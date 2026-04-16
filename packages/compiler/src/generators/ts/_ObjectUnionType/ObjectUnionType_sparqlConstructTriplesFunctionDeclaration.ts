import { pascalCase } from "change-case";
import { Maybe } from "purify-ts";
import { imports } from "../imports.js";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectUnionType_sparqlConstructTriplesFunctionDeclaration(
  this: ObjectUnionType,
): Maybe<Code> {
  if (!this.features.has("sparql")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export function ${syntheticNamePrefix}sparqlConstructTriples({ filter, focusIdentifier, variablePrefix }: { filter: ${this.filterType} | undefined; focusIdentifier: ${imports.NamedNode} | ${imports.Variable}; ignoreRdfType: boolean; variablePrefix: string }): readonly ${imports.sparqljs}.Triple[] {
  return [${joinCode(
    this.concreteMemberTypes.map(
      (memberType) =>
        code`...${memberType.staticModuleName}.${syntheticNamePrefix}sparqlConstructTriples({ filter: filter?.on?.${memberType.name}, focusIdentifier, ignoreRdfType: false, variablePrefix: \`\${variablePrefix}${pascalCase(memberType.name)}\` }).concat()`,
    ),
    { on: ", " },
  )}];
}`);
}
