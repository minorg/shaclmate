import { Resource } from "rdfjs-resource";
import type * as ast from "../../ast/index.js";
import { stringToValidTsIdentifier } from "./stringToValidTsIdentifier.js";

function* tsNameAlternatives(astName: ast.Name): Iterable<string | undefined> {
  yield astName.shaclmateName.extract();
  yield astName.shName.extract()?.replace(" ", "_");
  yield astName.label.extract()?.replace(" ", "_");
  yield astName.propertyPath
    .chain((propertyPath) => propertyPath.uniqueLocalPart())
    .extract();
  yield astName.propertyPath
    .chain((propertyPath) =>
      propertyPath.curie.map((curie) => `${curie.prefix}_${curie.reference}`),
    )
    .extract();
  if (astName.identifier.termType === "NamedNode") {
    yield astName.identifier.uniqueLocalPart().extract();
    yield astName.identifier.curie
      .map((curie) => `${curie.prefix}_${curie.reference}`)
      .extract();
  }
  yield astName.propertyPath
    .map((propertyPath) => Resource.Identifier.toString(propertyPath))
    .extract();
  yield Resource.Identifier.toString(astName.identifier);
}

export function tsName(astName: ast.Name): string {
  for (const tsNameAlternative of tsNameAlternatives(astName)) {
    if (tsNameAlternative) {
      return stringToValidTsIdentifier(tsNameAlternative);
    }
  }

  throw new Error("should never reach this point");
}
