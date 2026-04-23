import type { NodeKind } from "@shaclmate/shacl-ast";

import { Memoize } from "typescript-memoize";

import type { TsFeature } from "../enums/TsFeature.js";
import { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IntersectionType } from "./IntersectionType.js";
import type { IriType } from "./IriType.js";
import type { LiteralType } from "./LiteralType.js";
import type { ObjectType } from "./ObjectType.js";
import type { TermType } from "./TermType.js";
import type { Type } from "./Type.js";
import type { UnionType } from "./UnionType.js";

/**
 * A compound of types, such as an intersection or union.
 *
 * Compound = combining types at the type level e.g., functions, intersections, unions
 * Composite = combining values at runtime (e.g., arrays, structs whose members have the same type)
 */
export abstract class AbstractCompoundType<
  MemberT extends AbstractCompoundType.Member<MemberTypeT>,
  MemberTypeT extends AbstractCompoundType.MemberType,
> extends AbstractType {
  /**
   * Members.
   *
   * Mutable to support cycle-handling logic in the compiler.
   */
  readonly #members: MemberT[] = [];

  /**
   * TypeScript features to generate.
   */
  readonly #tsFeatures: ReadonlySet<TsFeature>;

  /**
   * Type discriminant
   */
  abstract readonly kind: "IntersectionType" | "UnionType";

  constructor({
    tsFeatures,
    ...superParameters
  }: {
    tsFeatures: ReadonlySet<TsFeature>;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.#tsFeatures = tsFeatures;
  }

  get members(): readonly MemberT[] {
    return this.#members;
  }

  @Memoize()
  override get nodeKinds(): ReadonlySet<NodeKind> {
    const nodeKinds = new Set<NodeKind>();
    for (const member of this.members) {
      for (const nodeKind of member.type.nodeKinds) {
        nodeKinds.add(nodeKind);
      }
    }
    return nodeKinds;
  }

  override get recursive(): boolean {
    return this.members.some((member) => member.type.recursive);
  }

  @Memoize()
  get tsFeatures(): ReadonlySet<TsFeature> {
    // Members of the compound type must have the same tsFeatures.
    // They must also have distinct RDF types or no RDF types at all.
    const mergedMemberTsFeatures = new Set<TsFeature>();
    for (let memberI = 0; memberI < this.members.length; memberI++) {
      const member = this.members[memberI];

      switch (member.type.kind) {
        case "IntersectionType":
        case "ObjectType":
        case "UnionType":
          break;
        default:
          continue;
      }

      if (memberI === 0) {
        for (const tsFeature of member.type.tsFeatures) {
          mergedMemberTsFeatures.add(tsFeature);
        }
      }

      if (member.type.tsFeatures.size !== mergedMemberTsFeatures.size) {
        throw new Error(
          `${this} has a member (${member}) with different tsFeatures than the other members`,
        );
      }

      for (const tsFeature of member.type.tsFeatures) {
        if (!mergedMemberTsFeatures.has(tsFeature)) {
          throw new Error(
            `${this} has a member (${member}) with different tsFeatures than the other members`,
          );
        }
      }
    }

    return this.#tsFeatures;
  }

  addMember(member: MemberT): void {
    this.#members.push(member);
  }

  override equals(other: AbstractCompoundType<MemberT, MemberTypeT>): boolean {
    // return arrayEquals(Type.equals)(this.memberTypes, other.memberTypes);
    // Don't recurse
    return this.shapeIdentifier.equals(other.shapeIdentifier);
  }

  toString(): string {
    return `${this.kind}(memberTypes=[${this.members.map((memberType) => memberType.toString()).join(", ")}])`;
  }
}

export namespace AbstractCompoundType {
  export interface Member<TypeT extends MemberType> {
    readonly type: TypeT;
  }

  export type MemberType =
    | BlankNodeType
    | IdentifierType
    | IntersectionType
    | IriType
    | LiteralType
    | ObjectType
    | TermType
    | UnionType;

  export function isMemberType(type: Type): type is MemberType {
    switch (type.kind) {
      case "BlankNodeType":
      case "IdentifierType":
      case "IntersectionType":
      case "IriType":
      case "LiteralType":
      case "ObjectType":
      case "TermType":
      case "UnionType":
        return true;
      case "DefaultValueType":
      case "LazyObjectOptionType":
      case "LazyObjectSetType":
      case "LazyObjectType":
      case "ListType":
      case "OptionType":
      case "SetType":
        return false;
    }
  }
}
