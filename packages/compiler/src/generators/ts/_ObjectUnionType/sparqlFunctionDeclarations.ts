import { camelCase, pascalCase } from "change-case";
import { type Code, code, joinCode } from "ts-poet";
import { sparqlConstructQueryFunctionDeclaration } from "../_ObjectType/sparqlConstructQueryFunctionDeclaration.js";
import { sparqlConstructQueryStringFunctionDeclaration } from "../_ObjectType/sparqlConstructQueryStringFunctionDeclaration.js";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { sharedImports } from "../sharedImports.js";
import { sharedSnippets } from "../sharedSnippets.js";
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
export function ${syntheticNamePrefix}sparqlConstructTriples(parameters?: { ignoreRdfType?: boolean, subject?: sparqljs.Triple["subject"], variablePrefix?: string }): readonly ${sharedImports.sparqljs}.Triple[] {
  return [${joinCode(
    this.concreteMemberTypes.map(
      (memberType) =>
        code`...${memberType.staticModuleName}.${syntheticNamePrefix}sparqlConstructTriples({ subject: parameters?.subject ?? dataFactory.variable!("${camelCase(this.nameString)}${pascalCase(memberType.nameString)}"), variablePrefix: parameters?.variablePrefix ? \`\${parameters.variablePrefix}${pascalCase(memberType.nameString)}\` : "${camelCase(this.nameString)}${pascalCase(memberType.nameString)}" }).concat()`,
    ),
    { on: ", " },
  )}];
}`,
    code`\
export function ${syntheticNamePrefix}sparqlWherePatterns(parameters?: { filter?: ${this.filterType}; ignoreRdfType?: boolean; preferredLanguages?: readonly string[]; subject?: sparqljs.Triple["subject"], variablePrefix?: string }): readonly ${sharedSnippets.SparqlPattern}[] {
${joinCode([
  code`let patterns: ${sharedSnippets.SparqlPattern}[] = [];`,
  code`\
    const subject = parameters?.subject ?? ${sharedImports.dataFactory}.variable!("${camelCase(this.nameString)}");
    if (subject.termType === "Variable") {
      patterns = patterns.concat(${this.identifierType.sparqlWherePatternsFunction}({
          filter: parameters?.filter?.${syntheticNamePrefix}identifier,
          ignoreRdfType: false,
          preferredLanguages: parameters?.preferredLanguages,
          propertyPatterns: [],
          schema: ${this.identifierType.schema},
          valueVariable: subject,
          variablePrefix: subject.termType === "Variable" ? subject.value : "${camelCase(this.nameString)}",
      }));
    }`,
  code`patterns.push({ patterns: [${joinCode(
    this.concreteMemberTypes.map(
      (memberType) =>
        code`${{
          patterns: `${memberType.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns({ filter: parameters?.filter?.on?.${memberType.name}, subject: parameters?.subject ?? dataFactory.variable!("${camelCase(this.nameString)}${pascalCase(memberType.nameString)}"), variablePrefix: parameters?.variablePrefix ? \`\${parameters.variablePrefix}${pascalCase(memberType.nameString)}\` : "${camelCase(this.nameString)}${pascalCase(memberType.nameString)}" }).concat()`,
          type: '"group"',
        }}`,
    ),
    { on: ", " },
  )}], type: "union" });`,
  code`return patterns;`,
])}
}`,
  ];
}
