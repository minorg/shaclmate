import TermSet from "@rdfjs/term-set";
import type { NamedNode } from "@rdfjs/types";
import { Either, Left } from "purify-ts";
import { Resource } from "rdfjs-resource";
import type * as ast from "../ast/index.js";
import type { TsFeature } from "../enums/TsFeature.js";
import type * as input from "../input/index.js";

export function flattenAstObjectCompositeTypeMemberTypes({
  objectCompositeTypeKind,
  memberTypes,
  shape,
}: {
  objectCompositeTypeKind: "ObjectIntersectionType" | "ObjectUnionType";
  memberTypes: readonly (
    | ast.ObjectType
    | ast.ObjectIntersectionType
    | ast.ObjectUnionType
  )[];
  shape: input.Shape;
}): Either<
  Error,
  { memberTypes: readonly ast.ObjectType[]; tsFeatures: Set<TsFeature> }
> {
  const flattenedMemberTypes: ast.ObjectType[] = [];
  for (const memberType of memberTypes) {
    switch (memberType.kind) {
      case "ObjectType":
        flattenedMemberTypes.push(memberType);
        break;
      case "ObjectIntersectionType":
      case "ObjectUnionType":
        if (memberType.kind === objectCompositeTypeKind) {
          flattenedMemberTypes.push(...memberType.memberTypes);
          break;
        }
        return Left(
          new Error(
            `${objectCompositeTypeKind} with a nested ${memberType.kind}`,
          ),
        );
    }
  }

  // Members of the composite type must have the same tsFeatures.
  // They must also have distinct RDF types or no RDF types at all.
  const nonExternMemberTypes = flattenedMemberTypes.filter(
    (memberType) => !memberType.extern,
  );
  const fromRdfTypes = new TermSet<NamedNode>();
  const tsFeatures = new Set<TsFeature>();
  for (
    let memberTypeI = 0;
    memberTypeI < nonExternMemberTypes.length;
    memberTypeI++
  ) {
    const memberType = nonExternMemberTypes[memberTypeI];

    if (memberTypeI === 0) {
      for (const tsFeature of memberType.tsFeatures) {
        tsFeatures.add(tsFeature);
      }
    }

    memberType.fromRdfType.ifJust((fromRdfType) =>
      fromRdfTypes.add(fromRdfType),
    );

    if (memberType.tsFeatures.size !== tsFeatures.size) {
      return Left(
        new Error(
          `${shape} has a member ObjectType (${Resource.Identifier.toString(memberType.name.identifier)}) with different tsFeatures than the other member ObjectType's`,
        ),
      );
    }

    for (const tsFeature of memberType.tsFeatures) {
      if (!tsFeatures.has(tsFeature)) {
        return Left(
          new Error(
            `${shape} has a member ObjectType (${Resource.Identifier.toString(memberType.name.identifier)}) with different tsFeatures than the other member ObjectType's`,
          ),
        );
      }
    }
  }

  if (
    fromRdfTypes.size > 0 &&
    fromRdfTypes.size !== nonExternMemberTypes.length
  ) {
    return Left(
      new Error(
        `one or more ${shape} members ([${nonExternMemberTypes.map((memberType) => Resource.Identifier.toString(memberType.name.identifier)).join(", ")}]) lack distinguishing fromRdfType's ({${[...fromRdfTypes].map((fromRdfType) => Resource.Identifier.toString(fromRdfType)).join(", ")}})`,
      ),
    );
  }

  return Either.of({
    memberTypes: flattenedMemberTypes,
    tsFeatures,
  });
}
