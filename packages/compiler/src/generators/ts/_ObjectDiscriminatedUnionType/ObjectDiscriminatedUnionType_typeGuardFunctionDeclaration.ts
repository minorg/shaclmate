import type { ObjectDiscriminatedUnionType } from "../ObjectDiscriminatedUnionType.js";
import { singleEntryRecord } from "../singleEntryRecord.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectDiscriminatedUnionType_typeGuardFunctionDeclaration(
  this: ObjectDiscriminatedUnionType,
): Record<string, Code> {
  if (!this.configuration.features.has("Object.type")) {
    return {};
  }

  const name = this.name.extract();
  if (!name) {
    return {};
  }

  if (name === `${this.configuration.syntheticNamePrefix}Object`) {
    return {};
  }

  return singleEntryRecord(
    `is${name}`,
    code`\
    export function is${name}(object: ${this.configuration.syntheticNamePrefix}Object): object is ${name} {
      return ${joinCode(
        this.members.map(
          (member) =>
            code`${member.type.name.unsafeCoerce()}.is${member.type.name.unsafeCoerce()}(object)`,
        ),
        { on: " || " },
      )};
    }`,
  );
}
