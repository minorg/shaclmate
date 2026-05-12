import type { Logger } from "ts-log";
import type { Imports_ } from "./Imports_.js";
import type { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import type { Snippet } from "./Snippet.js";
import type { Snippets_ } from "./Snippets_.js";

export type SnippetFactory = (parameters: {
  imports: Imports_;
  logger: Logger;
  rdfjsTermExpression: typeof rdfjsTermExpression;
  snippets: Snippets_;
  syntheticNamePrefix: string;
}) => Snippet;
