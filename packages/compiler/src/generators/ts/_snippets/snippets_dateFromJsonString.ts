import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_dateFromJsonString: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}dateFromJsonString`,
    code`\
const ${syntheticNamePrefix}dateFromJsonString: ${snippets.FromJsonValueFunction}<string, Date, ${snippets.DateSchema}> = 
  (jsonValue) => ${imports.Either}.encase(() => new Date(jsonValue));`,
  );
