import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { Maybe } from "purify-ts";
import type { Curie } from "./Curie.js";

export interface Name {
  readonly identifier:
    | BlankNode
    | (NamedNode & {
        /**
         * Compact URI (CURIE).
         */
        readonly curie: Maybe<Curie>;

        /**
         * Unique unqualified/local identifier, derived from the CURIE.
         *
         * Returns Just if the local identifier is unique across all CURIEs, otherwise Nothing.
         */
        readonly uniqueLocalPart: () => Maybe<string>;
      });

  /**
   * rdfs:label.
   */
  readonly label: Maybe<string>;

  /**
   * sh:path for property shapes.
   */
  readonly propertyPath: Maybe<
    NamedNode & {
      /**
       * Compact URI (CURIE).
       */
      readonly curie: Maybe<Curie>;

      /**
       * Unique unqualified/local identifier, derived from the CURIE.
       *
       * Returns Just if the local identifier is unique across all CURIEs, otherwise Nothing.
       */
      readonly uniqueLocalPart: () => Maybe<string>;
    }
  >;

  /**
   * sh:name.
   */
  readonly shName: Maybe<string>;

  /**
   * shaclmate:name.
   */
  readonly shaclmateName: Maybe<string>;

  /**
   * Synthesized in code.
   */
  readonly syntheticName: Maybe<string>;
}
