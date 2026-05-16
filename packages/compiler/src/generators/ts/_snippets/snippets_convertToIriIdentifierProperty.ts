import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToIriIdentifierProperty: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToIriIdentifierProperty`,
    code`\
function ${syntheticNamePrefix}convertToIriIdentifierProperty<IriT extends string = string>(identifier: (() => ${imports.NamedNode}<IriT>) | ${imports.NamedNode}<IriT>): () => ${imports.NamedNode}<IriT> {
  switch (typeof identifier) {
    case "function":
      return identifier;
    case "object":
      return () => identifier;
    }
  }
}`,
  );
