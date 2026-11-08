import dataFactory from "@rdfx/data-factory";
import { Maybe } from "purify-ts";
import * as ast from "../ast/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";

export function synthesizePartialAstStructType(
  this: ShapesGraphToAstTransformer,
  {
    identifierType,
  }: {
    identifierType: ast.IdentifierType | ast.IriType;
  },
): ast.StructType {
  let syntheticName: string;
  switch (identifierType.kind) {
    case "Identifier":
      syntheticName = "DefaultPartial";
      break;
    case "Iri":
      syntheticName = "NamedDefaultPartial";
      break;
  }

  let partialAstStructType = this.syntheticAstStructTypes.find(
    (syntheticAstStructType) =>
      syntheticAstStructType.name.extract() === syntheticName &&
      ast.Type.equals(syntheticAstStructType.identifierType, identifierType),
  );
  if (partialAstStructType) {
    return partialAstStructType;
  }

  partialAstStructType = new ast.StructType({
    comment: Maybe.empty(),
    extern: false,
    fromRdfType: Maybe.empty(),
    identifierType,
    label: Maybe.empty(),
    name: Maybe.of(syntheticName),
    shapeIdentifier: dataFactory.namedNode(
      `urn:shaclmate:synthetic:${syntheticName}`,
    ),
    synthetic: true,
    toRdfTypes: [],
    tsImports: [],
  });
  partialAstStructType.addField(
    new ast.StructType.IdentifierField({
      structType: partialAstStructType,
      type: identifierType,
    }),
  );

  this.syntheticAstStructTypes.push(partialAstStructType);

  return partialAstStructType;
}
