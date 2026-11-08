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

  // export function memberStructTypes(
  //   structCompoundType: StructCompoundType,
  // ): readonly StructType[] {
  //   const memberStructTypes_: StructType[] = [];

  //   for (const member of structCompoundType.members) {
  //     switch (member.type.kind) {
  //       case "Struct":
  //         memberStructTypes_.push(member.type);
  //         break;
  //       case "Intersection":
  //       case "DiscriminatedUnion": {
  //         invariant(member.type.kind === structCompoundType.kind);
  //         memberStructTypes_.push(...memberStructTypes(member.type));
  //         break;
  //       }
  //     }
  //   }

  //   invariant(
  //     memberStructTypes_.length >= structCompoundType.members.length,
  //     "object compound type has no member StructType's",
  //   );

  //   // Member object types must have distinct RDF types or no RDF types at all.
  //   const fromRdfTypes = new TermSet<NamedNode>();
  //   let expectUniqueFromRdfTypesCount = 0;
  //   for (const memberStructType of memberStructTypes_) {
  //     if (memberStructType.extern) {
  //       continue;
  //     }
  //     expectUniqueFromRdfTypesCount++;
  //     memberStructType.fromRdfType.ifJust((fromRdfType) =>
  //       fromRdfTypes.add(fromRdfType),
  //     );
  //   }
  //   if (
  //     fromRdfTypes.size > 0 &&
  //     fromRdfTypes.size !== expectUniqueFromRdfTypesCount
  //   ) {
  //     throw new Error(
  //       `one or more ${structCompoundType} members ([${memberStructTypes_.map((memberType) => memberType.toString()).join(", ")}]) lack distinguishing fromRdfType's ({${[...fromRdfTypes].join(", ")}})`,
  //     );
  //   }

  //   return memberStructTypes_;
  // }
}
