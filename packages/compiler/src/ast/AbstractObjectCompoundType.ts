import TermSet from "@rdfjs/term-set";
import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import type { TsFeature } from "enums/TsFeature.js";
import { Either, Maybe } from "purify-ts";
import { Resource } from "rdfjs-resource";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { AbstractCompoundType } from "./AbstractCompoundType.js";
import { IdentifierType } from "./IdentifierType.js";
import type { ObjectIntersectionType } from "./ObjectIntersectionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { Type } from "./Type.js";

/**
 * Abstract base class for a compound of object types, such as an intersection or union.
 */
export abstract class AbstractObjectCompoundType<
  ObjectCompoundTypeT extends ObjectIntersectionType | ObjectUnionType,
> extends AbstractCompoundType<ObjectCompoundTypeT | ObjectType> {
  /**
   * Should generated code derived from this type be visible outside its module?
   *
   * Defaults to true.
   */
  readonly export: boolean;

  abstract override readonly kind: "ObjectIntersectionType" | "ObjectUnionType";

  /**
   * Identifier of the shape this ObjectType was derived from.
   */
  readonly shapeIdentifier: BlankNode | NamedNode;

  /**
   * TypeScript features to generate.
   */
  readonly #tsFeatures: Maybe<ReadonlySet<TsFeature>>;

  constructor({
    export_,
    shapeIdentifier,
    tsFeatures,
    ...superParameters
  }: {
    comment: Maybe<string>;
    export_: boolean;
    label: Maybe<string>;
    name: Maybe<string>;
    shapeIdentifier: BlankNode | NamedNode;
    tsFeatures: Maybe<ReadonlySet<TsFeature>>;
  } & ConstructorParameters<
    typeof AbstractCompoundType<ObjectCompoundTypeT | ObjectType>
  >[0]) {
    super(superParameters);
    this.export = export_;
    this.shapeIdentifier = shapeIdentifier;
    this.#tsFeatures = tsFeatures;
  }

  override equals(
    other: AbstractObjectCompoundType<ObjectCompoundTypeT>,
  ): boolean {
    // Don't recurse
    return this.shapeIdentifier.equals(other.shapeIdentifier);
  }

  @Memoize()
  get identifierType(): IdentifierType {
    const memberIdentifierTypeNodeKinds = new Set<IdentifierNodeKind>();
    const memberIdentifierTypesIn = new TermSet<NamedNode>();
    for (const memberType of this.memberTypes) {
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

    return new IdentifierType({
      comment: Maybe.empty(),
      defaultValue: Maybe.empty(),
      hasValues: [],
      in_: [...memberIdentifierTypesIn],
      label: Maybe.empty(),
      name: Maybe.empty(),
      nodeKinds: memberIdentifierTypeNodeKinds,
    });
  }

  @Memoize()
  get memberObjectTypes(): readonly ObjectType[] {
    const memberObjectTypes: ObjectType[] = [];

    for (const memberType of this.memberTypes) {
      switch (memberType.kind) {
        case "ObjectType":
          memberObjectTypes.push(memberType);
          break;
        case "ObjectIntersectionType":
        case "ObjectUnionType": {
          invariant(memberType.kind === this.kind);
          memberObjectTypes.push(...memberType.memberObjectTypes);
          break;
        }
      }
    }

    invariant(memberObjectTypes.length >= this.memberTypes.length);

    // Member object types must have distinct RDF types or no RDF types at all.
    const fromRdfTypes = new TermSet<NamedNode>();
    let expectUniqueFromRdfTypesCount = 0;
    for (const memberObjectType of memberObjectTypes) {
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
        `one or more ${this} members ([${memberObjectTypes.map((memberType) => memberType.toString()).join(", ")}]) lack distinguishing fromRdfType's ({${[...fromRdfTypes].map((fromRdfType) => Resource.Identifier.toString(fromRdfType)).join(", ")}})`,
      );
    }

    return memberObjectTypes;
  }

  @Memoize()
  get tsFeatures(): ReadonlySet<TsFeature> {
    // Members of the compound type must have the same tsFeatures.
    // They must also have distinct RDF types or no RDF types at all.
    const mergedMemberTsFeatures = new Set<TsFeature>();
    for (
      let memberTypeI = 0;
      memberTypeI < this.memberObjectTypes.length;
      memberTypeI++
    ) {
      const memberType = this.memberObjectTypes[memberTypeI];

      if (memberTypeI === 0) {
        for (const tsFeature of memberType.tsFeatures) {
          mergedMemberTsFeatures.add(tsFeature);
        }
      }

      if (memberType.tsFeatures.size !== mergedMemberTsFeatures.size) {
        throw new Error(
          `${this} has a member ObjectType (${memberType}) with different tsFeatures than the other member ObjectType's`,
        );
      }

      for (const tsFeature of memberType.tsFeatures) {
        if (!mergedMemberTsFeatures.has(tsFeature)) {
          throw new Error(
            `${this} has a member ObjectType (${memberType}) with different tsFeatures than the other member ObjectType's`,
          );
        }
      }
    }

    return this.#tsFeatures.orDefault(mergedMemberTsFeatures);
  }

  override addMemberType(memberType: Type): Either<Error, void> {
    return Either.encase(() => {
      switch (memberType.kind) {
        case "ObjectType":
          super.addMemberType(memberType);
          break;
        case "ObjectIntersectionType":
          if (this.kind === memberType.kind) {
            super.addMemberType(memberType as any);
          } else {
            throw new Error(
              `${this}: has incompatible compound type composition (has-a ${memberType})`,
            );
          }
          break;
        case "ObjectUnionType":
          if (this.kind === memberType.kind) {
            super.addMemberType(memberType as any);
          } else {
            throw new Error(
              `${this}: has incompatible compound type composition (has-a ${memberType})`,
            );
          }
          break;
        default:
          throw new Error(
            `${this} has one or more non-(ObjectIntersectionType | ObjectType | ObjectUnionType) node shapes in its logical constraint`,
          );
      }
    });
  }

  override toString(): string {
    return `${this.kind}(shapeIdentifier=${Resource.Identifier.toString(this.shapeIdentifier)})`;
  }
}
