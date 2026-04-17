import { invariant } from "ts-invariant";
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
  MemberTypeT extends AbstractCompoundType.MemberType,
> extends AbstractType {
  /**
   * Type discriminant
   */
  abstract readonly kind: "IntersectionType" | "UnionType";

  /**
   * Member types.
   *
   * Mutable to support cycle-handling logic in the compiler.
   */
  readonly #memberTypes: MemberTypeT[];

  /**
   * TypeScript features to generate.
   */
  readonly #tsFeatures: ReadonlySet<TsFeature>;

  constructor({
    memberTypes,
    tsFeatures,
    ...superParameters
  }: {
    memberTypes?: readonly MemberTypeT[];
    tsFeatures: ReadonlySet<TsFeature>;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.#memberTypes = memberTypes?.concat() ?? [];
    this.#tsFeatures = tsFeatures;
  }

  addMemberType(memberType: MemberTypeT): void {
    this.#memberTypes.push(memberType);
  }

  override equals(other: AbstractCompoundType<MemberTypeT>): boolean {
    // return arrayEquals(Type.equals)(this.memberTypes, other.memberTypes);
    // Don't recurse
    return this.shapeIdentifier.equals(other.shapeIdentifier);
  }

  get memberTypes(): readonly MemberTypeT[] {
    invariant(this.#memberTypes.length > 0);
    return this.#memberTypes;
  }

  @Memoize()
  get tsFeatures(): ReadonlySet<TsFeature> {
    // Members of the compound type must have the same tsFeatures.
    // They must also have distinct RDF types or no RDF types at all.
    const mergedMemberTsFeatures = new Set<TsFeature>();
    for (
      let memberTypeI = 0;
      memberTypeI < this.memberTypes.length;
      memberTypeI++
    ) {
      const memberType = this.memberTypes[memberTypeI];

      switch (memberType.kind) {
        case "IntersectionType":
        case "ObjectType":
        case "UnionType":
          break;
        default:
          continue;
      }

      if (memberTypeI === 0) {
        for (const tsFeature of memberType.tsFeatures) {
          mergedMemberTsFeatures.add(tsFeature);
        }
      }

      if (memberType.tsFeatures.size !== mergedMemberTsFeatures.size) {
        throw new Error(
          `${this} has a member (${memberType}) with different tsFeatures than the other members`,
        );
      }

      for (const tsFeature of memberType.tsFeatures) {
        if (!mergedMemberTsFeatures.has(tsFeature)) {
          throw new Error(
            `${this} has a member (${memberType}) with different tsFeatures than the other members`,
          );
        }
      }
    }

    return this.#tsFeatures;
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
