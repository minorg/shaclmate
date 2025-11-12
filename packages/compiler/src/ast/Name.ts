import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { Maybe } from "purify-ts";
import { Resource } from "rdfjs-resource";
import type { Curie } from "./Curie.js";
import { maybeEquals, strictEquals, termEquals } from "./equals.js";

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

export namespace Name {
  export function equals(left: Name, right: Name): boolean {
    if (!termEquals(left.identifier, right.identifier)) {
      return false;
    }

    if (!left.label.equals(right.label)) {
      return false;
    }

    if (!maybeEquals(left.propertyPath, right.propertyPath, termEquals)) {
      return false;
    }

    if (!maybeEquals(left.shName, right.shName, strictEquals)) {
      return false;
    }

    if (!maybeEquals(left.shaclmateName, right.shaclmateName, strictEquals)) {
      return false;
    }

    if (!maybeEquals(left.syntheticName, right.syntheticName, strictEquals)) {
      return false;
    }

    return true;
  }

  // biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
  export function toString(name: Name): string {
    return Resource.Identifier.toString(name.identifier);
  }
}
