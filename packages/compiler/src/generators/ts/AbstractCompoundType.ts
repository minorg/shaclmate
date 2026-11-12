import { Memoize } from "typescript-memoize";
import { AbstractUserDefinedType } from "./AbstractUserDefinedType.js";
import type { Type } from "./Type.js";

/**
 * A compound of types, such as an intersection or union.
 */
export abstract class AbstractCompoundType<
  MemberT extends { type: MemberTypeT },
  MemberTypeT extends Type,
> extends AbstractUserDefinedType {
  abstract readonly members: readonly MemberT[];

  @Memoize()
  override get mutable(): boolean {
    return this.members.some((member) => member.type.mutable);
  }

  get referencesNamedType(): boolean {
    return (
      this.name.isJust() ||
      this.members.some((member) => member.type.referencesNamedType)
    );
  }

  @Memoize()
  get toRdfResourceValueTypes(): AbstractUserDefinedType["toRdfResourceValueTypes"] {
    const set = new Set<"BlankNode" | "Literal" | "NamedNode">();
    for (const member of this.members) {
      for (const value of member.type.toRdfResourceValueTypes) {
        set.add(value);
      }
    }
    return set;
  }
}

export namespace AbstractCompoundType {
  export type ConversionFunction = AbstractUserDefinedType.ConversionFunction;
  export type DiscriminatedType = AbstractUserDefinedType.DiscriminatedType;
  export type GraphqlType = AbstractUserDefinedType.GraphqlType;
  export type JsonType = AbstractUserDefinedType.JsonType;
  export type JsType = AbstractUserDefinedType.JsType;
}
