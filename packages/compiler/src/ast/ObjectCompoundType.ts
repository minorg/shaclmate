import dataFactory from "@rdfjs/data-model";
import TermSet from "@rdfjs/term-set";
import type { NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { Maybe } from "purify-ts";
import { Resource } from "rdfjs-resource";
import invariant from "ts-invariant";
import { BlankNodeType } from "./BlankNodeType.js";
import { IdentifierType } from "./IdentifierType.js";
import { IriType } from "./IriType.js";
import type { ObjectIntersectionType } from "./ObjectIntersectionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";

export type ObjectCompoundType = ObjectIntersectionType | ObjectUnionType;

export namespace ObjectCompoundType {
  export function identifierType(
    objectCompoundType: ObjectCompoundType,
  ): BlankNodeType | IdentifierType | IriType {
    const memberIdentifierTypeNodeKinds = new Set<IdentifierNodeKind>();
    const memberIdentifierTypesIn = new TermSet<NamedNode>();
    for (const memberType of memberObjectTypes(objectCompoundType)) {
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
      });
    }

    const memberIdentifierTypeNodeKind = [...memberIdentifierTypeNodeKinds][0];
    switch (memberIdentifierTypeNodeKind) {
      case "BlankNode":
        return new BlankNodeType({
          comment: Maybe.empty(),
          label: Maybe.empty(),
        });
      case "IRI":
        return new IriType({
          comment: Maybe.empty(),
          hasValues: [],
          in_: [...memberIdentifierTypesIn],
          label: Maybe.empty(),
          name: Maybe.empty(),
          shapeIdentifier: dataFactory.blankNode(),
        });
      default:
        memberIdentifierTypeNodeKind satisfies never;
        throw new Error("should never reach here");
    }
  }

  export function memberObjectTypes(
    objectCompoundType: ObjectCompoundType,
  ): readonly ObjectType[] {
    const memberObjectTypes_: ObjectType[] = [];

    for (const memberType of objectCompoundType.memberTypes) {
      switch (memberType.kind) {
        case "ObjectType":
          memberObjectTypes_.push(memberType);
          break;
        case "IntersectionType":
        case "UnionType": {
          invariant(memberType.kind === objectCompoundType.kind);
          memberObjectTypes_.push(...memberObjectTypes(memberType));
          break;
        }
      }
    }

    invariant(
      memberObjectTypes.length >= objectCompoundType.memberTypes.length,
    );

    // Member object types must have distinct RDF types or no RDF types at all.
    const fromRdfTypes = new TermSet<NamedNode>();
    let expectUniqueFromRdfTypesCount = 0;
    for (const memberObjectType of memberObjectTypes_) {
      if (memberObjectType.extern) {
        continue;
      }
      expectUniqueFromRdfTypesCount++;
      memberObjectType.fromRdfType.ifJust((fromRdfType) =>
        fromRdfTypes.add(fromRdfType),
      );
    }
    if (
      fromRdfTypes.size > 0 &&
      fromRdfTypes.size !== expectUniqueFromRdfTypesCount
    ) {
      throw new Error(
        `one or more ${objectCompoundType} members ([${memberObjectTypes_.map((memberType) => memberType.toString()).join(", ")}]) lack distinguishing fromRdfType's ({${[...fromRdfTypes].map((fromRdfType) => Resource.Identifier.toString(fromRdfType)).join(", ")}})`,
      );
    }

    return memberObjectTypes_;
  }
}
