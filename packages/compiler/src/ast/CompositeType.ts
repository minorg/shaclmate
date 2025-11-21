import { invariant } from "ts-invariant";
import { Type } from "./Type.js";
import { arrayEquals } from "./equals.js";

/**
 * A composite of types, such as an intersection or union.
 */
export abstract class CompositeType<MemberTypeT extends Type> {
  /**
   * Type discriminator
   */
  abstract readonly kind:
    | "IntersectionType"
    | "ObjectIntersectionType"
    | "ObjectUnionType"
    | "UnionType";

  /**
   * Member types.
   *
   * Mutable to support cycle-handling logic in the compiler.
   */
  readonly #memberTypes: MemberTypeT[];

  constructor(parameters?: { memberTypes?: readonly MemberTypeT[] }) {
    this.#memberTypes = parameters?.memberTypes?.concat() ?? [];
  }

  addMemberType(memberType: MemberTypeT): void {
    this.#memberTypes.push(memberType);
  }

  equals(other: CompositeType<MemberTypeT>): boolean {
    return arrayEquals(this.memberTypes, other.memberTypes, Type.equals);
  }

  get memberTypes(): readonly MemberTypeT[] {
    invariant(this.#memberTypes.length > 0);
    return this.#memberTypes;
  }

  toString(): string {
    return `${this.kind}(memberTypes=[${this.memberTypes.map((memberType) => memberType.toString()).join(", ")}])`;
  }
}
