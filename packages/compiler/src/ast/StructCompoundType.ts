import type { NamedNode } from "@rdfjs/types";
import { TermSet } from "@rdfx/collection";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { Either, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { BlankNodeType } from "./BlankNodeType.js";
import { IdentifierType } from "./IdentifierType.js";
import { IriType } from "./IriType.js";
import type { StructDiscriminatedUnionType } from "./StructDiscriminatedUnionType.js";
import type { StructIntersectionType } from "./StructIntersectionType.js";
import type { StructType } from "./StructType.js";

export type StructCompoundType =
  | StructIntersectionType
  | StructDiscriminatedUnionType;

export namespace StructCompoundType {
  export function identifierType(
    structCompoundType: StructCompoundType | StructType,
  ): Either<Error, BlankNodeType | IdentifierType | IriType> {
    if (structCompoundType.kind === "Struct") {
      return Either.of(structCompoundType.identifierType);
    }

    const memberIdentifierTypeNodeKinds = new Set<IdentifierNodeKind>();
    const memberIdentifierTypesIn = new TermSet<NamedNode>();

    for (const member of structCompoundType.members) {
      const memberIdentifierTypeEither = identifierType(member.type);
      if (memberIdentifierTypeEither.isLeft()) {
        return memberIdentifierTypeEither;
      }

      memberIdentifierTypeEither.ifRight((memberIdentifierType) => {
        for (const nodeKind of memberIdentifierType.nodeKinds) {
          memberIdentifierTypeNodeKinds.add(nodeKind);
        }
        for (const in_ of memberIdentifierType.in_) {
          memberIdentifierTypesIn.add(in_);
        }
      });
    }
    invariant(memberIdentifierTypeNodeKinds.size > 0);

    if (memberIdentifierTypeNodeKinds.size === 2) {
      return Either.of(
        new IdentifierType({
          comment: Maybe.empty(),
          label: Maybe.empty(),
          name: Maybe.empty(),
          shapeIdentifier: structCompoundType.shapeIdentifier,
        }),
      );
    }

    const memberIdentifierTypeNodeKind = [...memberIdentifierTypeNodeKinds][0];
    switch (memberIdentifierTypeNodeKind) {
      case "BlankNode":
        return Either.of(
          new BlankNodeType({
            comment: Maybe.empty(),
            label: Maybe.empty(),
            name: Maybe.empty(),
            shapeIdentifier: structCompoundType.shapeIdentifier,
          }),
        );
      case "IRI":
        return Either.of(
          new IriType({
            comment: Maybe.empty(),
            hasValues: [],
            in_: [...memberIdentifierTypesIn],
            label: Maybe.empty(),
            name: Maybe.empty(),
            shapeIdentifier: structCompoundType.shapeIdentifier,
          }),
        );
      default:
        memberIdentifierTypeNodeKind satisfies never;
        throw new Error("should never reach here");
    }
  }
}
