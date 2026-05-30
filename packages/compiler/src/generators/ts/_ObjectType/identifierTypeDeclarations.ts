import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function identifierTypeDeclarations(this: ObjectType): readonly Code[] {
  if (!this.configuration.features.has("Object.type")) {
    return [];
  }

  // Bespoke identifier type and associated functions
  return [
    code`export type Identifier = ${this.identifierType.expression};`,
    code`\
export namespace Identifier {
  export const parse = ${this.identifierType.parseFunction};
  export const stringify = ${this.identifierType.stringifyFunction};
}`,
  ];
}
