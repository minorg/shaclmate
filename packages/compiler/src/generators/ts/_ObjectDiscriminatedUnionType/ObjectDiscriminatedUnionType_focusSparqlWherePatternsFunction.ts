import { pascalCase } from "change-case";
import type { Callable } from "../Callable.js";
import type { ObjectDiscriminatedUnionType } from "../ObjectDiscriminatedUnionType.js";
import { code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function ObjectDiscriminatedUnionType_focusSparqlWherePatternsFunction(
  this: ObjectDiscriminatedUnionType,
): Callable {
  return this._function({
    type: code`${this.reusables.snippets.FocusSparqlWherePatternsFunction}<${this.filterType}`,
    unannotatedExpression: code`\
({ filter, focusIdentifier, preferredLanguages, variablePrefix }) => {
${joinCode([
  code`let patterns: ${this.reusables.snippets.SparqlPattern}[] = [];`,
  code`\
if (focusIdentifier.termType === "Variable") {
  patterns = patterns.concat(${this.identifierType.valueSparqlWherePatternsFunction.unannotatedUsage}({
      filter: filter?.${this.configuration.syntheticNamePrefix}identifier,
      ignoreRdfType: false,
      preferredLanguages,
      propertyPatterns: [],
      schema: ${this.identifierType.schema},
      valueVariable: focusIdentifier,
      variablePrefix,
  }));
}`,
  code`patterns.push({ patterns: [${joinCode(
    this.members.map(
      (member) =>
        code`${{
          patterns: code`${member.type.name.unsafeCoerce()}.focusSparqlWherePatterns({ filter: filter?.on?.${member.primaryDiscriminantValue}, focusIdentifier, ignoreRdfType: false, preferredLanguages, variablePrefix: \`\${variablePrefix}${pascalCase(member.type.name.unsafeCoerce())}\` }).concat()`,
          type: literalOf("group"),
        }}`,
    ),
    { on: ", " },
  )}], type: "union" });`,
  code`return patterns;`,
])}
}`,
    unqualifiedName: "focusSparqlWherePatterns",
  });
}
