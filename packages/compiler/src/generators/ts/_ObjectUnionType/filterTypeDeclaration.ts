import { type Code, code } from "ts-poet";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function filterTypeDeclaration(this: ObjectUnionType): Code {
  return code`\
export interface ${syntheticNamePrefix}Filter {
  readonly ${syntheticNamePrefix}identifier?: ${this.identifierType.filterType};
  readonly on?: { ${this.memberTypes.map((memberType) => `readonly ${memberType.name}?: Omit<${memberType.filterType}, "${syntheticNamePrefix}identifier">`).join(";")} }
}`;
}
