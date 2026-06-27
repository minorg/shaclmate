import type { ObjectDiscriminatedUnionType } from "../ObjectDiscriminatedUnionType.js";
import { singleEntryRecord } from "../singleEntryRecord.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectDiscriminatedUnionType_toRdfResourceFunctionDeclaration(
  this: ObjectDiscriminatedUnionType,
): Record<string, Code> {
  if (!this.configuration.features.has("Object.toRdf")) {
    return {};
  }

  const name = this.name.unsafeCoerce();

  return singleEntryRecord(
    `toRdfResource`,
    code`\
export const toRdfResource: ${this.reusables.snippets.ToRdfResourceFunction}<${name}> = (object, options) => {
${joinCode(
  this.members
    .map(
      (member) =>
        code`if (${member.type.name.unsafeCoerce()}.is${member.type.name.unsafeCoerce()}(object)) { return ${member.type.name.unsafeCoerce()}.toRdfResource(object, options); }`,
    )
    .concat(code`throw new Error("unrecognized type");`),
)}
};`,
  );
}
