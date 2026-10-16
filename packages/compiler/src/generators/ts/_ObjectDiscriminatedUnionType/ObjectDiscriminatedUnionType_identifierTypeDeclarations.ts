import type { ObjectDiscriminatedUnionType } from "../ObjectDiscriminatedUnionType.js";
import { singleEntryRecord } from "../singleEntryRecord.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectDiscriminatedUnionType_identifierTypeDeclarations(
  this: ObjectDiscriminatedUnionType,
): Record<string, Code> {
  if (!this.configuration.features.has("Object.type")) {
    return {};
  }

  return singleEntryRecord(
    `Identifier`,
    code`\
export type Identifier = ${this.identifierType.expression};
export namespace Identifier {
  export const parse = ${this.identifierType.parseFunction};
}`,
  );
}
