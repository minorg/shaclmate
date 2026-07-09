import type { ObjectType } from "../ObjectType.js";
import { singleEntryRecord } from "../singleEntryRecord.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_identifierTypeDeclarations(
  this: ObjectType,
): Record<string, Code> {
  // Bespoke identifier type and associated functions
  return singleEntryRecord(
    "Identifier",
    code`\
export type Identifier = ${this.identifierType.expression};
export namespace Identifier {
  export const parse = ${this.identifierType.parseFunction};
  export const stringify = ${this.identifierType.stringifyFunction};
}`,
  );
}
