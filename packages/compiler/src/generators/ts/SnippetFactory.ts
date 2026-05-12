import type { Imports_ } from "./Imports_.js";
import type { Snippet } from "./Snippet.js";
import type { Snippets_ } from "./Snippets_.js";

export type SnippetFactory = (parameters: {
  imports: Imports_;
  snippets: Snippets_;
  syntheticNamePrefix: string;
}) => Snippet;
