import { pascalCase } from "change-case";
import type { Callable } from "../Callable.js";
import type { ObjectDiscriminatedUnionType } from "../ObjectDiscriminatedUnionType.js";
import { code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectDiscriminatedUnionType_focusSparqlConstructTriplesFunction(
  this: ObjectDiscriminatedUnionType,
): Callable {
  return this._function({
    type: code`${this.reusables.snippets.FocusSparqlConstructTriplesFunction}<${this.filterType}>`,
    unannotatedExpression: code`\
({ filter, focusIdentifier, variablePrefix }) =>
  [${joinCode(
    this.members.map(
      (member) =>
        code`...${member.type.name.unsafeCoerce()}.focusSparqlConstructTriples({ filter: filter?.on?.${member.primaryDiscriminantValue}, focusIdentifier, ignoreRdfType: false, variablePrefix: \`\${variablePrefix}${pascalCase(member.type.name.unsafeCoerce())}\` }).concat()`,
    ),
    { on: ", " },
  )}]`,
    unqualifiedName: "focusSparqlConstructTriples",
  });
}
