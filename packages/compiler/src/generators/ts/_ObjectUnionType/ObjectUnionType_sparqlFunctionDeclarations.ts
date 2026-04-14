import { pascalCase } from "change-case";
import { ObjectType_sparqlConstructQueryFunctionDeclaration } from "../_ObjectType/ObjectType_sparqlConstructQueryFunctionDeclaration.js";
import { ObjectType_sparqlConstructQueryStringFunctionDeclaration } from "../_ObjectType/ObjectType_sparqlConstructQueryStringFunctionDeclaration.js";
import { imports } from "../imports.js";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { snippets } from "../snippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function ObjectUnionType_sparqlFunctionDeclarations(
  this: ObjectUnionType,
): readonly Code[] {
  if (!this.features.has("sparql")) {
    return [];
  }

  return [
    ObjectType_sparqlConstructQueryFunctionDeclaration.bind(this)(),
    ObjectType_sparqlConstructQueryStringFunctionDeclaration.bind(this)(),
    code`\
export function ${syntheticNamePrefix}sparqlConstructTriples({ filter, focusIdentifier, variablePrefix }: { filter: ${this.filterType} | undefined; focusIdentifier: ${imports.NamedNode} | ${imports.Variable}; ignoreRdfType: boolean; variablePrefix: string }): readonly ${imports.sparqljs}.Triple[] {
  return [${joinCode(
    this.concreteMemberTypes.map(
      (memberType) =>
        code`...${memberType.staticModuleName}.${syntheticNamePrefix}sparqlConstructTriples({ filter: filter?.on?.${memberType.name}, focusIdentifier, ignoreRdfType: false, variablePrefix: \`\${variablePrefix}${pascalCase(memberType.name)}\` }).concat()`,
    ),
    { on: ", " },
  )}];
}`,
    code`\
export function ${syntheticNamePrefix}sparqlWherePatterns({ filter, focusIdentifier, preferredLanguages, variablePrefix }: { filter: ${this.filterType} | undefined; focusIdentifier: ${imports.NamedNode} | ${imports.Variable}; ignoreRdfType: boolean; preferredLanguages: readonly string[] | undefined; variablePrefix: string }): readonly ${snippets.SparqlPattern}[] {
${joinCode([
  code`let patterns: ${snippets.SparqlPattern}[] = [];`,
  code`\
if (focusIdentifier.termType === "Variable") {
  patterns = patterns.concat(${this.identifierType.sparqlWherePatternsFunction}({
      filter: filter?.${syntheticNamePrefix}identifier,
      ignoreRdfType: false,
      preferredLanguages,
      propertyPatterns: [],
      schema: ${this.identifierType.schema},
      valueVariable: focusIdentifier,
      variablePrefix,
  }));
}`,
  code`patterns.push({ patterns: [${joinCode(
    this.concreteMemberTypes.map(
      (memberType) =>
        code`${{
          patterns: code`${memberType.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns({ filter: filter?.on?.${memberType.name}, focusIdentifier, ignoreRdfType: false, preferredLanguages, variablePrefix: \`\${parameters.variablePrefix}${pascalCase(memberType.name)}\` }).concat()`,
          type: literalOf("group"),
        }}`,
    ),
    { on: ", " },
  )}], type: "union" });`,
  code`return patterns;`,
])}
}`,
  ];
}
