import type PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import type { NamedNode } from "@rdfjs/types";
import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Curie } from "../ast/Curie.js";
import { logger } from "../logger.js";

/**
 * Factory for Compact URIs (CURIEs). Tracks whether the reference part of the CURIE is unique.
 */
export class CurieFactory {
  private readonly prefixMap: PrefixMap;
  private readonly referenceCounts: Record<string, Record<string, number>> = {};

  constructor({ prefixMap }: { prefixMap: PrefixMap }) {
    this.prefixMap = prefixMap;
  }

  create(namedNode: NamedNode): Maybe<Curie> {
    return Maybe.fromNullable(this.prefixMap.shrink(namedNode)?.value).map(
      (value) => {
        const split = value.split(":", 2);
        invariant(split.length === 2);
        const prefix = split[0];
        const reference = split[1];

        if (typeof this.referenceCounts[reference] === "undefined") {
          this.referenceCounts[reference] = {};
        }
        if (typeof this.referenceCounts[reference][prefix] === "undefined") {
          this.referenceCounts[reference][prefix] = 1;
        } else {
          this.referenceCounts[reference][prefix] += 1;
        }

        return new Curie({
          hasUniqueReference: () => {
            const referenceCounts = this.referenceCounts[reference];
            if (Object.entries(referenceCounts).length === 1) {
              return true;
            }
            logger.debug(
              `duplicate local part ${reference} in ${JSON.stringify(referenceCounts)}`,
            );
            return false;
          },
          prefix: split[0],
          reference: split[1],
          value: namedNode.value,
        });
      },
    );
  }
}
