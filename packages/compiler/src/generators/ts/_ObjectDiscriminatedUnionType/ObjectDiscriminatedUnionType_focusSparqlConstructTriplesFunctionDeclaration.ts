import { pascalCase } from "change-case";
import type { ObjectDiscriminatedUnionType } from "../ObjectDiscriminatedUnionType.js";
import { singleEntryRecord } from "../singleEntryRecord.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectDiscriminatedUnionType_focusSparqlConstructTriplesFunctionDeclaration(
  this: ObjectDiscriminatedUnionType,
): Record<string, Code> {
  if (!this.configuration.features.has("Object.SPARQL")) {
    return {};
  }

  return singleEntryRecord(
    `focusSparqlConstructTriples`,
    code`\
export function focusSparqlConstructTriples({ filter, focusIdentifier, variablePrefix }: { filter: ${this.filterType} | undefined; focusIdentifier: ${this.reusables.imports.NamedNode} | ${this.reusables.imports.Variable}; ignoreRdfType: boolean; variablePrefix: string }): readonly ${this.reusables.imports.sparqljs}.Triple[] {
  return [${joinCode(
    this.members.map(
      (member) =>
        code`...${member.type.name.unsafeCoerce()}.focusSparqlConstructTriples({ filter: filter?.on?.${member.type.name.unsafeCoerce()}, focusIdentifier, ignoreRdfType: false, variablePrefix: \`\${variablePrefix}${pascalCase(member.type.name.unsafeCoerce())}\` }).concat()`,
    ),
    { on: ", " },
  )}];
}`,
  );
}
