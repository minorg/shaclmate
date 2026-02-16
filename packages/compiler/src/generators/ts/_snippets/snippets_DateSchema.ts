import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_DateSchema = conditionalOutput(
  `${syntheticNamePrefix}DateSchema`,
  code`\
interface ${syntheticNamePrefix}DateSchema {
  in?: readonly Date[];
  kind: "DateTimeType" | "DateType",
}`,
);
