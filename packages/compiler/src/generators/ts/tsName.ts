import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { Maybe } from "purify-ts";
import { type PropertyPath, Resource } from "rdfjs-resource";
import * as ast from "../../ast/index.js";
import { stringToValidTsIdentifier } from "./stringToValidTsIdentifier.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export function tsName(astConstruct: {
  label: Maybe<string>;
  name: Maybe<string>;
  path?: ast.Curie | PropertyPath;
  synthetic?: boolean;
  shapeIdentifier: BlankNode | NamedNode;
}): string {
  // The order of checks determines the order of preferences.

  // Explicit shaclmate:name or sh:name
  const name = astConstruct.name.extract();
  if (name) {
    if (astConstruct.synthetic) {
      return `${syntheticNamePrefix}${name}`;
    }
    return stringToValidTsIdentifier(name);
  }

  // Explicit rdfs:label
  const label = astConstruct.label.extract();
  if (label) {
    return stringToValidTsIdentifier(label.replace(" ", "_"));
  }

  const path = astConstruct.path;

  // Unique reference part on a CURIE sh:path
  if (path instanceof ast.Curie && path.hasUniqueReference) {
    return stringToValidTsIdentifier(path.reference);
  }

  // Unique reference part on a CURIE shape identifier
  const shapeIdentifier = astConstruct.shapeIdentifier;
  if (
    shapeIdentifier instanceof ast.Curie &&
    shapeIdentifier.hasUniqueReference
  ) {
    return stringToValidTsIdentifier(shapeIdentifier.reference);
  }

  // CURIE sh:path
  if (path instanceof ast.Curie) {
    return stringToValidTsIdentifier(`${path.prefix}_${path.reference}`);
  }

  // CURIE shape identifier
  if (shapeIdentifier instanceof ast.Curie) {
    return stringToValidTsIdentifier(
      `${shapeIdentifier.prefix}_${shapeIdentifier.reference}`,
    );
  }

  // IRI shape identifier
  if (shapeIdentifier.termType === "NamedNode") {
    return stringToValidTsIdentifier(shapeIdentifier.value);
  }

  // IRI sh:path
  if (path?.termType === "NamedNode") {
    return stringToValidTsIdentifier(path.value);
  }

  throw new Error(
    `should never reach this point (shapeIdentifier=${Resource.Identifier.toString(shapeIdentifier)})`,
  );
}
