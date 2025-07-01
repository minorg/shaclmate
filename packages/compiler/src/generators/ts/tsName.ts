import { Resource } from "rdfjs-resource";
import type * as ast from "../../ast/index.js";
import { stringToValidTsIdentifier } from "./stringToValidTsIdentifier.js";

export function tsName(astName: ast.Name): string {
  for (const tsNameAlternative of [
    astName.shaclmateName.extract(),
    astName.shName.extract()?.replace(" ", "_"),
    astName.label.extract()?.replace(" ", "_"),
    astName.identifier.termType === "NamedNode"
      ? astName.identifier.uniqueLocalPart().extract()
      : undefined,
    astName.identifier.termType === "NamedNode"
      ? astName.identifier.curie
          .map((curie) => `${curie.prefix}_${curie.reference}`)
          .extract()
      : undefined,
    astName.propertyPath
      .chain((propertyPath) => propertyPath.uniqueLocalPart())
      .extract(),
    astName.propertyPath
      .chain((propertyPath) =>
        propertyPath.curie.map((curie) => `${curie.prefix}_${curie.reference}`),
      )
      .extract(),
    astName.propertyPath
      .map((propertyPath) => Resource.Identifier.toString(propertyPath))
      .extract(),
    Resource.Identifier.toString(astName.identifier),
  ]) {
    if (tsNameAlternative) {
      return stringToValidTsIdentifier(tsNameAlternative);
    }
  }

  throw new Error("should never reach this point");
}
