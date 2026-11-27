import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Identifier_JsonObject: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Identifier.JsonObject`,
    code`\
namespace ${syntheticNamePrefix}Identifier {    
  export interface JsonObject<IdT extends string = string> {
    "@id": IdT;
  }
    
  export namespace JsonObject {
    export const schema = ${imports.z}.object({
      "@id": ${imports.z}.string().min(1)
    });
  }
}`,
  );
