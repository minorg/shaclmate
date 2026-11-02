import type { Callable } from "../Callable.js";
import type { ObjectDiscriminatedUnionType } from "../ObjectDiscriminatedUnionType.js";
import { code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectDiscriminatedUnionType_toRdfResourceFunction(
  this: ObjectDiscriminatedUnionType,
): Callable {
  const identifierTypeExpression = this.name
    .map(() => this.identifierTypeAlias)
    .orDefault(this.identifierType.expression);

  return this._function({
    type: code`${this.reusables.snippets.ToRdfResourceFunction}<${identifierTypeExpression}, ${this.expression}>`,
    unannotatedExpression: code`\
(object, options) => {
${joinCode(
  this.members
    .map(
      (member) =>
        code`if (${member.type.name.unsafeCoerce()}.is${member.type.name.unsafeCoerce()}(object)) { return ${member.type.name.unsafeCoerce()}.toRdfResource(object, options); }`,
    )
    .concat(code`throw new Error("unrecognized type");`),
)}
};`,
    unqualifiedName: "toRdfResource",
  });
}
