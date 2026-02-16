import { type Code, code, joinCode } from "ts-poet";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function filterTypeDeclaration(this: ObjectUnionType): Code {
  return code`\
export interface ${syntheticNamePrefix}Filter {
  readonly ${syntheticNamePrefix}identifier?: ${this.identifierType.filterType};
  readonly on?: { ${joinCode(this.memberTypes.map((memberType) => code`readonly ${memberType.name}?: Omit<${memberType.filterType}, "${syntheticNamePrefix}identifier">;`))} }
}`;
}
