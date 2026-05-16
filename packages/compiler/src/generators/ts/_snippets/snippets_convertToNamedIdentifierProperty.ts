import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToNamedIdentifierProperty: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToNamedIdentifierProperty`,
    code`\
function ${syntheticNamePrefix}convertToNamedIdentifierProperty<NamedNodeT extends ${imports.NamedNode}>(identifier: (() => NamedNodeT) | NamedNodeT): () => NamedNodeT {
  switch (typeof identifier) {
    case "function":
      return identifier;
    case "object":
      return () => identifier;
    }
  }
}`,
  );
