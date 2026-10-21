import { Memoize } from "typescript-memoize";
import { AbstractStructuredType } from "./AbstractStructuredType.js";
import type { Type } from "./Type.js";
import type { Code } from "./ts-poet-wrapper.js";

export abstract class AbstractCompoundType<
  MemberT extends { type: MemberTypeT },
  MemberTypeT extends Type,
> extends AbstractStructuredType {
  abstract readonly members: readonly MemberT[];

  override graphqlResolveExpression({
    variables,
  }: {
    variables: { value: Code };
  }): Code {
    return variables.value;
  }

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
