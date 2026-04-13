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

    let propertyPath: ast.ObjectType.Property["path"] | undefined;

    if (astConstruct instanceof ast.ObjectType.Property) {
      // Pick up the common pattern of a property shape identifier being the node shape's identifier -localName,
      // like ex:NodeShape-property
      if (
        astConstruct.objectType.shapeIdentifier.termType === "NamedNode" &&
        astConstruct.shapeIdentifier.termType === "NamedNode"
      ) {
        const propertyShapeIdentifierPrefix = `${astConstruct.objectType.shapeIdentifier.value}-`;
        if (
          astConstruct.shapeIdentifier.value.startsWith(
            propertyShapeIdentifierPrefix,
          ) &&
          astConstruct.shapeIdentifier.value.length >
            propertyShapeIdentifierPrefix.length
        ) {
          return sanitize(
            astConstruct.shapeIdentifier.value.substring(
              propertyShapeIdentifierPrefix.length,
            ),
          );
        }
      }

      propertyPath = astConstruct.path;
    }

    // Unique reference part on a CURIE sh:path
    if (propertyPath instanceof ast.Curie && propertyPath.hasUniqueReference) {
      return sanitize(propertyPath.reference);
    }

    const shapeIdentifier = astConstruct.shapeIdentifier;

    // Unique reference part on a CURIE shape identifier
    if (
      shapeIdentifier instanceof ast.Curie &&
      shapeIdentifier.hasUniqueReference
    ) {
      return sanitize(shapeIdentifier.reference);
    }

    // CURIE sh:path
    if (propertyPath instanceof ast.Curie) {
      return sanitize(`${propertyPath.prefix}_${propertyPath.reference}`);
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
    if (propertyPath?.termType === "NamedNode") {
      return sanitize(propertyPath.value);
    }

    throw new Error(
      `should never reach this point (shapeIdentifier=${Resource.Identifier.toString(shapeIdentifier)})`,
    );
  };
}
