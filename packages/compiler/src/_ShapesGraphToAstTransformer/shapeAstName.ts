import type { NamedNode, Term } from "@rdfjs/types";
import { Maybe } from "purify-ts";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import { Curie } from "../ast/Curie.js";
import type * as ast from "../ast/index.js";
import * as input from "../input/index.js";
import { logger } from "../logger.js";
import { pickLiteral } from "./pickLiteral.js";

export function shapeAstName(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
): ast.Name {
  const namedIdentifier = (namedNode: NamedNode) => {
    const curie = Maybe.fromNullable(
      this.iriPrefixMap.shrink(namedNode)?.value,
    ).map(Curie.parse);
    curie.ifJust((curie) => {
      if (typeof this.iriLocalParts[curie.reference] === "undefined") {
        this.iriLocalParts[curie.reference] = {};
      }
      if (
        typeof this.iriLocalParts[curie.reference][curie.prefix] === "undefined"
      ) {
        this.iriLocalParts[curie.reference][curie.prefix] = 1;
      } else {
        this.iriLocalParts[curie.reference][curie.prefix] += 1;
      }
    });

    return {
      equals: (other: Term | null | undefined) => {
        return namedNode.equals(other);
      },
      curie,
      termType: "NamedNode" as const,
      uniqueLocalPart: () =>
        curie
          .filter((curie) => {
            const curieReferenceInPrefixes =
              this.iriLocalParts[curie.reference];
            if (Object.entries(curieReferenceInPrefixes).length === 1) {
              return true;
            }
            logger.debug(
              `duplicate local part ${curie.reference} in ${JSON.stringify(curieReferenceInPrefixes)}`,
            );
            return false;
          })
          .map((curie) => curie.reference),
      value: namedNode.value,
    };
  };

  let propertyPath: ast.Name["propertyPath"];
  let shName: Maybe<string>;
  if (shape instanceof input.PropertyShape) {
    if (shape.path.kind === "PredicatePath") {
      propertyPath = Maybe.of(namedIdentifier(shape.path.iri));
      // logger.debug(
      //   `shape ${shape} property path: ${JSON.stringify(propertyPath.unsafeCoerce())}`,
      // );
    } else {
      propertyPath = Maybe.empty();
      logger.warn(`property shape ${shape} has ${shape.path.kind} path`);
    }

    shName = pickLiteral(shape.names).map((literal) => literal.value);
  } else {
    propertyPath = Maybe.empty();
    shName = Maybe.empty();
  }

  return {
    identifier:
      shape.identifier.termType === "NamedNode"
        ? namedIdentifier(shape.identifier)
        : shape.identifier,
    label: pickLiteral(shape.labels).map((literal) => literal.value),
    propertyPath,
    shName,
    shaclmateName: shape.shaclmateName,
  };
}
