import { Memoize } from "typescript-memoize";
import { AbstractStructuredType } from "./AbstractStructuredType.js";
import type { Type } from "./Type.js";

export abstract class AbstractCompoundType<
  MemberT extends { type: MemberTypeT },
  MemberTypeT extends Type,
> extends AbstractStructuredType {
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
  get toRdfResourceValueTypes(): AbstractStructuredType["toRdfResourceValueTypes"] {
    const set = new Set<"BlankNode" | "Literal" | "NamedNode">();
    for (const member of this.members) {
      for (const value of member.type.toRdfResourceValueTypes) {
        set.add(value);
      }
    }
    return set;
  }
}
