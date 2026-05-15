import type { NodeKind } from "@shaclmate/shacl-ast";

import { Memoize } from "typescript-memoize";

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
   * Type discriminant
   */
  abstract override readonly kind: "IntersectionType" | "UnionType";

  /**
   * Was this type synthesized or did it come from SHACL?
   */
  readonly synthetic: boolean;

  constructor({
    synthetic,
    ...superParameters
  }: {
    synthetic: boolean;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.synthetic = synthetic;
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

  addMember(member: MemberT): void {
    this.#members.push(member);
  }

  override equals(other: AbstractCompoundType<MemberT, MemberTypeT>): boolean {
    // return arrayEquals(Type.equals)(this.memberTypes, other.memberTypes);
    // Don't recurse
    return this.shapeIdentifier.equals(other.shapeIdentifier);
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
