import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IntersectionType } from "./IntersectionType.js";
import type { IriType } from "./IriType.js";
import type { LiteralType } from "./LiteralType.js";
import type { ObjectType } from "./ObjectType.js";
import type { PlaceholderType } from "./PlaceholderType.js";
import type { TermType } from "./TermType.js";
import type { Type } from "./Type.js";
import type { UnionType } from "./UnionType.js";

/**
 * A compound of types, such as an intersection or union.
 *
 * Compound = combining types at the type level e.g., functions, intersections, unions
 * Composite = combining values at runtime (e.g., arrays, structs whose members have the same type)
 */
export abstract class AbstractCompoundType extends AbstractType {
  /**
   * Type discriminant
   */
  abstract readonly kind: "IntersectionType" | "UnionType";

  /**
   * Member types.
   *
   * Mutable to support cycle-handling logic in the compiler.
   */
  readonly #memberTypes: AbstractCompoundType.MemberType[];

  /**
   * Name of this type, from shaclmate:name.
   */
  readonly name: Maybe<string>;

  /**
   * Identifier of the shape this type was derived from.
   */
  readonly shapeIdentifier: BlankNode | NamedNode;

  constructor({
    memberTypes,
    name,
    shapeIdentifier,
    ...superParameters
  }: {
    memberTypes?: readonly AbstractCompoundType.MemberType[];
    name: Maybe<string>;
    shapeIdentifier: BlankNode | NamedNode;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.#memberTypes = memberTypes?.concat() ?? [];
    this.name = name;
    this.shapeIdentifier = shapeIdentifier;
  }

  addMemberType(memberType: AbstractCompoundType.MemberType): void {
    this.#memberTypes.push(memberType);
  }

  override equals(other: AbstractCompoundType): boolean {
    // return arrayEquals(Type.equals)(this.memberTypes, other.memberTypes);
    // Don't recurse
    return this.shapeIdentifier.equals(other.shapeIdentifier);
  }

  get memberTypes(): readonly AbstractCompoundType.MemberType[] {
    invariant(this.#memberTypes.length > 0);
    return this.#memberTypes;
  }

  toString(): string {
    return `${this.kind}(memberTypes=[${this.memberTypes.map((memberType) => memberType.toString()).join(", ")}])`;
  }
}

export namespace AbstractCompoundType {
  export type MemberType =
    | BlankNodeType
    | IdentifierType
    | IntersectionType
    | IriType
    | LiteralType
    | ObjectType
    | PlaceholderType
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
      case "PlaceholderType":
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
