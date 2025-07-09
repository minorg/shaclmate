import { Maybe } from "purify-ts";
import { StructureKind, type TypeAliasDeclarationStructure } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";

export function graphqlTypeAliasDeclaration(
  this: ObjectType,
): Maybe<TypeAliasDeclarationStructure> {
  if (!this.features.has("graphql")) {
    return Maybe.empty();
  }

  if (this.extern) {
    return Maybe.empty();
  }

  const members: string[] = [];
  if (this.ownProperties.length > 0) {
    members.push(
      `{ ${this.ownProperties
        .flatMap((property) => property.graphqlPropertySignature.toList())
        .map(
          (propertySignature) =>
            `readonly "${propertySignature.name}": ${propertySignature.type}`,
        )
        .join("; ")} }`,
    );
  }
  for (const parentObjectType of this.parentObjectTypes) {
    members.push(parentObjectType.graphqlName);
  }

  return Maybe.of({
    isExported: true,
    kind: StructureKind.TypeAlias,
    name: "Graphql",
    type: members.length > 0 ? members.join(" & ") : "object",
  });
}
