import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { Maybe } from "purify-ts";
import { Resource } from "rdfjs-resource";
import * as ast from "../../ast/index.js";
import { stringToValidTsIdentifier } from "./stringToValidTsIdentifier.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export function tsName(astConstruct: {
  label: Maybe<string>;
  name: Maybe<string>;
  path?: NamedNode;
  synthetic?: boolean;
  shapeIdentifier: BlankNode | NamedNode;
}): string {
  const name = astConstruct.name.extract();
  if (name) {
    if (astConstruct.synthetic) {
      return `${syntheticNamePrefix}${name}`;
    }
    return stringToValidTsIdentifier(name);
  }

  const label = astConstruct.label.extract();
  if (label) {
    return stringToValidTsIdentifier(label.replace(" ", "_"));
  }

  const path = astConstruct.path;
  if (path instanceof ast.Curie) {
    if (path.hasUniqueReference) {
      return stringToValidTsIdentifier(path.reference);
    }
    return stringToValidTsIdentifier(`${path.prefix}_${path.reference}`);
  }

  const shapeIdentifier = astConstruct.shapeIdentifier;
  if (
    shapeIdentifier.termType === "NamedNode" &&
    shapeIdentifier instanceof ast.Curie
  ) {
    if (shapeIdentifier.hasUniqueReference) {
      return stringToValidTsIdentifier(shapeIdentifier.reference);
    }
    return stringToValidTsIdentifier(
      `${shapeIdentifier.prefix}_${shapeIdentifier.reference}`,
    );
  }

  throw new Error(
    `should never reach this point (shapeIdentifier=${Resource.Identifier.toString(shapeIdentifier)})`,
  );
}
