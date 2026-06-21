import TermSet from "@rdfjs/term-set";
import type { NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { BlankNodeType } from "./BlankNodeType.js";
import { IdentifierType } from "./IdentifierType.js";
import { IriType } from "./IriType.js";
import type { StructIntersectionType } from "./StructIntersectionType.js";
import type { StructType } from "./StructType.js";
import type { StructUnionType } from "./StructUnionType.js";

export type StructCompoundType = StructIntersectionType | StructUnionType;

export namespace StructCompoundType {
  export function identifierType(
    objectCompoundType: StructCompoundType,
  ): BlankNodeType | IdentifierType | IriType {
    const memberIdentifierTypeNodeKinds = new Set<IdentifierNodeKind>();
    const memberIdentifierTypesIn = new TermSet<NamedNode>();
    for (const memberType of memberStructTypes(objectCompoundType)) {
      for (const nodeKind of memberType.identifierType.nodeKinds) {
        memberIdentifierTypeNodeKinds.add(nodeKind);
      }
      for (const in_ of memberType.identifierType.in_) {
        memberIdentifierTypesIn.add(in_);
      }
    }
    invariant(
      memberIdentifierTypeNodeKinds.size > 0,
      // `could not infer ${ast.Name.toString(astType.name)} member type node kinds`,
    );

    if (memberIdentifierTypeNodeKinds.size === 2) {
      return new IdentifierType({
        comment: Maybe.empty(),
        label: Maybe.empty(),
        name: Maybe.empty(),
        shapeIdentifier: objectCompoundType.shapeIdentifier,
      });
    }

    const memberIdentifierTypeNodeKind = [...memberIdentifierTypeNodeKinds][0];
    switch (memberIdentifierTypeNodeKind) {
      case "BlankNode":
        return new BlankNodeType({
          comment: Maybe.empty(),
          label: Maybe.empty(),
          name: Maybe.empty(),
          shapeIdentifier: objectCompoundType.shapeIdentifier,
        });
      case "IRI":
        return new IriType({
          comment: Maybe.empty(),
          hasValues: [],
          in_: [...memberIdentifierTypesIn],
          label: Maybe.empty(),
          name: Maybe.empty(),
          shapeIdentifier: objectCompoundType.shapeIdentifier,
        });
      default:
        memberIdentifierTypeNodeKind satisfies never;
        throw new Error("should never reach here");
    }
  }

  export function memberStructTypes(
    objectCompoundType: StructCompoundType,
  ): readonly StructType[] {
    const memberStructTypes_: StructType[] = [];

    for (const member of objectCompoundType.members) {
      switch (member.type.kind) {
        case "Struct":
          memberStructTypes_.push(member.type);
          break;
        case "Intersection":
        case "DiscriminatedUnion": {
          invariant(member.type.kind === objectCompoundType.kind);
          memberStructTypes_.push(...memberStructTypes(member.type));
          break;
        }
      }
    }

    invariant(
      memberStructTypes_.length >= objectCompoundType.members.length,
      "object compound type has no member StructType's",
    );

    // Member object types must have distinct RDF types or no RDF types at all.
    const fromRdfTypes = new TermSet<NamedNode>();
    let expectUniqueFromRdfTypesCount = 0;
    for (const memberStructType of memberStructTypes_) {
      if (memberStructType.extern) {
        continue;
      }
      expectUniqueFromRdfTypesCount++;
      memberStructType.fromRdfType.ifJust((fromRdfType) =>
        fromRdfTypes.add(fromRdfType),
      );
    }
    if (
      fromRdfTypes.size > 0 &&
      fromRdfTypes.size !== expectUniqueFromRdfTypesCount
    ) {
      throw new Error(
        `one or more ${objectCompoundType} members ([${memberStructTypes_.map((memberType) => memberType.toString()).join(", ")}]) lack distinguishing fromRdfType's ({${[...fromRdfTypes].join(", ")}})`,
      );
    }

    return memberStructTypes_;
  }
}
