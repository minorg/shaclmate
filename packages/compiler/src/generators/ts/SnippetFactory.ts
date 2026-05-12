import type { BlankNode, Literal, NamedNode, Variable } from "@rdfjs/types";
import type { Logger } from "ts-log";
import type { Imports } from "./Imports.js";
import type { Snippet } from "./Snippet.js";
import type { Snippets } from "./Snippets.js";
import type { Code } from "./ts-poet-wrapper.js";

export type SnippetFactory = (parameters: {
  imports: Imports;
  logger: Logger;
  rdfjsTermExpression: (
    rdfjsTerm:
      | Omit<BlankNode, "equals">
      | Omit<Literal, "equals">
      | Omit<NamedNode, "equals">
      | Omit<Variable, "equals">,
  ) => Code;
  snippets: Snippets;
  syntheticNamePrefix: string;
}) => Snippet;
