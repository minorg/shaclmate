import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_IdentifierSchema = conditionalOutput(
  `${syntheticNamePrefix}IdentifierSchema`,
  code`\
interface ${syntheticNamePrefix}IdentifierSchema {
  readonly kind: "IdentifierType";
}`,
);
