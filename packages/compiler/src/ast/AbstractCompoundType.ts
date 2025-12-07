import { invariant } from "ts-invariant";
import { Type } from "./Type.js";
import { arrayEquals } from "./equals.js";

/**
 * A compound of types, such as an intersection or union.
 *
 * Compound = combining types at the type level e.g., functions, intersections, unions
 * Composite = combining values at runtime (e.g., arrays, structs whose members have the same type)
 */
export abstract class AbstractCompoundType<MemberTypeT extends Type> {
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

  equals(other: AbstractCompoundType<MemberTypeT>): boolean {
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
