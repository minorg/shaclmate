import type { BlankNodeType } from "../BlankNodeType.js";
import type { IdentifierType } from "../IdentifierType.js";
import type { IriType } from "../IriType.js";
import { singleEntryRecord } from "../singleEntryRecord.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_identifierTypeDeclarations(this: {
  readonly identifierType: BlankNodeType | IdentifierType | IriType;
}): Record<string, Code> {
  // Bespoke identifier type and associated functions
  return singleEntryRecord(
    "Identifier",
    code`\
export type Identifier = ${this.identifierType.expression};
export namespace Identifier {
  export const parse = ${this.identifierType.parseFunction.annotatedUsage};
}`,
  );
}
