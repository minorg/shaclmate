import { camelCase, pascalCase } from "change-case";
import { type Code, code, joinCode, literalOf } from "ts-poet";
import { sparqlConstructQueryFunctionDeclaration } from "../_ObjectType/sparqlConstructQueryFunctionDeclaration.js";
import { sparqlConstructQueryStringFunctionDeclaration } from "../_ObjectType/sparqlConstructQueryStringFunctionDeclaration.js";
import { imports } from "../imports.js";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { snippets } from "../snippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function sparqlFunctionDeclarations(
  this: ObjectUnionType,
): readonly Code[] {
  if (!this.features.has("sparql")) {
    return [];
  }

  return [
    sparqlConstructQueryFunctionDeclaration.bind(this)(),
    sparqlConstructQueryStringFunctionDeclaration.bind(this)(),
    code`\
export function ${syntheticNamePrefix}sparqlConstructTriples(parameters?: { ignoreRdfType?: boolean, subject?: ${imports.sparqljs}.Triple["subject"], variablePrefix?: string }): readonly ${imports.sparqljs}.Triple[] {
  return [${joinCode(
    this.concreteMemberTypes.map(
      (memberType) =>
        code`...${memberType.staticModuleName}.${syntheticNamePrefix}sparqlConstructTriples({ subject: parameters?.subject ?? ${imports.dataFactory}.variable!("${camelCase(this.name)}${pascalCase(memberType.name)}"), variablePrefix: parameters?.variablePrefix ? \`\${parameters.variablePrefix}${pascalCase(memberType.name)}\` : "${camelCase(this.name)}${pascalCase(memberType.name)}" }).concat()`,
    ),
    { on: ", " },
  )}];
}`,
    code`\
export function ${syntheticNamePrefix}sparqlWherePatterns(parameters?: { filter?: ${this.filterType}; ignoreRdfType?: boolean; preferredLanguages?: readonly string[]; subject?: ${imports.sparqljs}.Triple["subject"], variablePrefix?: string }): readonly ${snippets.SparqlPattern}[] {
${joinCode([
  code`let patterns: ${snippets.SparqlPattern}[] = [];`,
  code`\
    const subject = parameters?.subject ?? ${imports.dataFactory}.variable!("${camelCase(this.name)}");
    if (subject.termType === "Variable") {
      patterns = patterns.concat(${this.identifierType.sparqlWherePatternsFunction}({
          filter: parameters?.filter?.${syntheticNamePrefix}identifier,
          ignoreRdfType: false,
          preferredLanguages: parameters?.preferredLanguages,
          propertyPatterns: [],
          schema: ${this.identifierType.schema},
          valueVariable: subject,
          variablePrefix: subject.termType === "Variable" ? subject.value : "${camelCase(this.name)}",
      }));
    }`,
  code`patterns.push({ patterns: [${joinCode(
    this.concreteMemberTypes.map(
      (memberType) =>
        code`${{
          patterns: code`${memberType.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns({ filter: parameters?.filter?.on?.${memberType.name}, subject: parameters?.subject ?? ${imports.dataFactory}.variable!("${camelCase(this.name)}${pascalCase(memberType.name)}"), variablePrefix: parameters?.variablePrefix ? \`\${parameters.variablePrefix}${pascalCase(memberType.name)}\` : "${camelCase(this.name)}${pascalCase(memberType.name)}" }).concat()`,
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
