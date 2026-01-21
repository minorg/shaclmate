import { camelCase, pascalCase } from "change-case";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import { sparqlConstructQueryFunctionDeclaration } from "../_ObjectType/sparqlConstructQueryFunctionDeclaration.js";
import { sparqlConstructQueryStringFunctionDeclaration } from "../_ObjectType/sparqlConstructQueryStringFunctionDeclaration.js";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { objectInitializer } from "../objectInitializer.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function sparqlFunctionDeclarations(
  this: ObjectUnionType,
): readonly FunctionDeclarationStructure[] {
  if (!this.features.has("sparql")) {
    return [];
  }

  return [
    sparqlConstructQueryFunctionDeclaration.bind(this)(),
    sparqlConstructQueryStringFunctionDeclaration.bind(this)(),
    {
      isExported: true,
      kind: StructureKind.Function,
      name: `${syntheticNamePrefix}sparqlConstructTriples`,
      // Accept ignoreRdfType in order to reuse code but don't pass it through, since deserialization may depend on it
      parameters: [
        {
          hasQuestionToken: true,
          name: "parameters",
          type: '{ ignoreRdfType?: boolean, subject?: sparqljs.Triple["subject"], variablePrefix?: string }',
        },
      ],
      returnType: "readonly sparqljs.Triple[]",
      statements: [
        `return [${this.concreteMemberTypes
          .map(
            (memberType) =>
              `...${memberType.staticModuleName}.${syntheticNamePrefix}sparqlConstructTriples({ subject: parameters?.subject ?? dataFactory.variable!("${camelCase(this.name)}${pascalCase(memberType.name)}"), variablePrefix: parameters?.variablePrefix ? \`\${parameters.variablePrefix}${pascalCase(memberType.name)}\` : "${camelCase(this.name)}${pascalCase(memberType.name)}" }).concat()`,
          )
          .join(", ")}];`,
      ],
    },
    {
      isExported: true,
      kind: StructureKind.Function,
      name: `${syntheticNamePrefix}sparqlWherePatterns`,
      // Accept ignoreRdfType in order to reuse code but don't pass it through, since deserialization may depend on it
      parameters: [
        {
          hasQuestionToken: true,
          name: "parameters",
          type: `{ filter?: ${this.filterType}; ignoreRdfType?: boolean; preferredLanguages?: readonly string[]; subject?: sparqljs.Triple["subject"], variablePrefix?: string }`,
        },
      ],
      returnType: "readonly sparqljs.Pattern[]",
      statements: [
        `return [{ patterns: [${this.concreteMemberTypes
          .map((memberType) =>
            objectInitializer({
              patterns: `${memberType.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns({ filter: parameters?.filter?.on?.${memberType.name}, subject: parameters?.subject ?? dataFactory.variable!("${camelCase(this.name)}${pascalCase(memberType.name)}"), variablePrefix: parameters?.variablePrefix ? \`\${parameters.variablePrefix}${pascalCase(memberType.name)}\` : "${camelCase(this.name)}${pascalCase(memberType.name)}" }).concat()`,
              type: '"group"',
            }),
          )
          .join(", ")}], type: "union" }];`,
      ],
    },
  ];
}
