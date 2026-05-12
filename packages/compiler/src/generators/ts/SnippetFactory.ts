import type { Logger } from "ts-log";
import type { Imports } from "./Imports.js";
import type { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import type { Snippet } from "./Snippet.js";
import type { Snippets } from "./Snippets.js";

export type SnippetFactory = (parameters: {
  imports: Imports;
  logger: Logger;
  rdfjsTermExpression: typeof rdfjsTermExpression;
  snippets: Snippets;
  syntheticNamePrefix: string;
}) => Snippet;
