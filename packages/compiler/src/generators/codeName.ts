import { Resource } from "rdfjs-resource";
import * as ast from "../ast/index.js";

/**
 * Code-safe name from an AST construct such as an ast.ObjectType.
 */
export function codeName(
  sanitize: (unsanitized: string) => string,
  syntheticNamePrefix: string,
) {
  return (
    astConstruct:
      | ast.ObjectType
      | ast.ObjectUnionType
      | ast.ObjectType.Property,
  ): string => {
    // The order of checks determines the order of preference.

    // Explicit shaclmate:name or sh:name
    const name = astConstruct.name.extract();
    if (name) {
      if (astConstruct instanceof ast.ObjectType && astConstruct.synthetic) {
        return `${syntheticNamePrefix}${name}`;
      }
      return sanitize(name);
    }

    // Explicit rdfs:label
    const label = astConstruct.label.extract();
    if (label) {
      return sanitize(label.replace(" ", "_"));
    }

    const path =
      astConstruct instanceof ast.ObjectType.Property
        ? astConstruct.path
        : undefined;

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
