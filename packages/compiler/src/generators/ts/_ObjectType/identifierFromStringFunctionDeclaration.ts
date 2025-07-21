import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";

export function identifierFromStringFunctionDeclaration(
  this: ObjectType,
): FunctionDeclarationStructure {
  const expressions: string[] = [
    `purify.Either.encase(() => rdfjsResource.Resource.Identifier.fromString({ dataFactory: ${this.dataFactoryVariable}, identifier }))`,
  ];

  if (this.identifierType.isNamedNodeKind) {
    expressions.push(
      `chain((identifier) => (identifier.termType === "NamedNode") ? purify.Either.of(identifier) : purify.Left(new Error("expected identifier to be NamedNode")); }`,
    );

    if (this.identifierType.in_.length > 0) {
      expressions.push(
        `chain((identifier) => { switch (identifier.value) { ${this.identifierType.in_.map((iri) => `case "${iri.value}": return purify.Either.of(identifier);`).join(" ")} default: return purify.Left(new Error("expected NamedNode identifier to be one of ${this.identifierType.in_.map((iri) => iri.value).join(" ")}))); }`,
      );
    }
  }

  return {
    isExported: true,
    kind: StructureKind.Function,
    name: "identifierFromString",
    parameters: [
      {
        name: "identifier",
        type: "string",
      },
    ],
    returnType: `purify.Either<Error, ${this.identifierType.name}>`,
    statements: [`return ${expressions.join(".")};`],
  };
}
