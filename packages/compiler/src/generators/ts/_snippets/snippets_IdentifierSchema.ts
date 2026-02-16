import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_IdentifierSchema = conditionalOutput(
  `${syntheticNamePrefix}IdentifierSchema`,
  code`\
interface ${syntheticNamePrefix}IdentifierSchema {
  readonly kind: "IdentifierType";
}`,
);
