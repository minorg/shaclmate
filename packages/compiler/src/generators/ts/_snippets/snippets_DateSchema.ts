import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_DateSchema = conditionalOutput(
  `${syntheticNamePrefix}DateSchema`,
  code`\
interface ${syntheticNamePrefix}DateSchema {
  in?: readonly Date[];
  kind: "DateTimeType" | "DateType",
}`,
);
