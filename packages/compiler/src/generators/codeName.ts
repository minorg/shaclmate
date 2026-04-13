import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { Maybe } from "purify-ts";
import { type PropertyPath, Resource } from "rdfjs-resource";
import * as ast from "../ast/index.js";

/**
 * Code-safe name from an AST construct such as an ast.ObjectType.
 */
export function codeName(
  sanitize: (unsanitized: string) => string,
  syntheticNamePrefix: string,
) {
  return (astConstruct: {
    label: Maybe<string>;
    name: Maybe<string>;
    path?: ast.Curie | PropertyPath;
    synthetic?: boolean;
    shapeIdentifier: BlankNode | NamedNode;
  }): string => {
    // The order of checks determines the order of preferences.

    // Explicit shaclmate:name or sh:name
    const name = astConstruct.name.extract();
    if (name) {
      if (astConstruct.synthetic) {
        return `${syntheticNamePrefix}${name}`;
      }
      return sanitize(name);
    }

    // Explicit rdfs:label
    const label = astConstruct.label.extract();
    if (label) {
      return sanitize(label.replace(" ", "_"));
    }

    const path = astConstruct.path;

    // Unique reference part on a CURIE sh:path
    if (path instanceof ast.Curie && path.hasUniqueReference) {
      return sanitize(path.reference);
    }

    // Unique reference part on a CURIE shape identifier
    const shapeIdentifier = astConstruct.shapeIdentifier;
    if (
      shapeIdentifier instanceof ast.Curie &&
      shapeIdentifier.hasUniqueReference
    ) {
      return sanitize(shapeIdentifier.reference);
    }

    // CURIE sh:path
    if (path instanceof ast.Curie) {
      return sanitize(`${path.prefix}_${path.reference}`);
    }

    // CURIE shape identifier
    if (shapeIdentifier instanceof ast.Curie) {
      return sanitize(`${shapeIdentifier.prefix}_${shapeIdentifier.reference}`);
    }

    // IRI shape identifier
    if (shapeIdentifier.termType === "NamedNode") {
      return sanitize(shapeIdentifier.value);
    }

    // IRI sh:path
    if (path?.termType === "NamedNode") {
      return sanitize(path.value);
    }

    throw new Error(
      `should never reach this point (shapeIdentifier=${Resource.Identifier.toString(shapeIdentifier)})`,
    );
  };
}
