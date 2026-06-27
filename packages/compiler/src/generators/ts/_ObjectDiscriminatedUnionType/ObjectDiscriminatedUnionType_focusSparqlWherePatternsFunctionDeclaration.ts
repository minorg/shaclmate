import { pascalCase } from "change-case";
import type { ObjectDiscriminatedUnionType } from "../ObjectDiscriminatedUnionType.js";
import { singleEntryRecord } from "../singleEntryRecord.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function ObjectDiscriminatedUnionType_focusSparqlWherePatternsFunctionDeclaration(
  this: ObjectDiscriminatedUnionType,
): Record<string, Code> {
  if (!this.configuration.features.has("Object.SPARQL")) {
    return {};
  }

  return singleEntryRecord(
    `focusSparqlWherePatterns`,
    code`\
export function focusSparqlWherePatterns({ filter, focusIdentifier, preferredLanguages, variablePrefix }: { filter: ${this.filterType} | undefined; focusIdentifier: ${this.reusables.imports.NamedNode} | ${this.reusables.imports.Variable}; ignoreRdfType: boolean; preferredLanguages: readonly string[] | undefined; variablePrefix: string }): readonly ${this.reusables.snippets.SparqlPattern}[] {
${joinCode([
  code`let patterns: ${this.reusables.snippets.SparqlPattern}[] = [];`,
  code`\
if (focusIdentifier.termType === "Variable") {
  patterns = patterns.concat(${this.identifierType.unsafeCoerce().valueSparqlWherePatternsFunction}({
      filter: filter?.${this.configuration.syntheticNamePrefix}identifier,
      ignoreRdfType: false,
      preferredLanguages,
      propertyPatterns: [],
      schema: ${this.identifierType.unsafeCoerce().schema},
      valueVariable: focusIdentifier,
      variablePrefix,
  }));
}`,
  code`patterns.push({ patterns: [${joinCode(
    this.members.map(
      (member) =>
        code`${{
          patterns: code`${member.type.name.unsafeCoerce()}.focusSparqlWherePatterns({ filter: filter?.on?.${member.type.name.unsafeCoerce()}, focusIdentifier, ignoreRdfType: false, preferredLanguages, variablePrefix: \`\${variablePrefix}${pascalCase(member.type.name.unsafeCoerce())}\` }).concat()`,
          type: literalOf("group"),
        }}`,
    ),
    { on: ", " },
  )}], type: "union" });`,
  code`return patterns;`,
])}
}`,
  );
}
