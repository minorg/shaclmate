import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_hashTerm: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}hashTerm`,
    code`\
function ${syntheticNamePrefix}hashTerm<HasherT extends ${snippets.Hasher}>(value: ${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}, hasher: HasherT): HasherT {
  hasher.update(value.termType);
  hasher.update(value.value);
  if (value.termType === "Literal") {
    hasher.update(value.datatype.value);
    hasher.update(value.language);
  }
  return hasher;
}`,
  );
