import type { Callable } from "../Callable.js";
import { DeclaredCallable } from "../DeclaredCallable.js";
import { InlineCallable } from "../InlineCallable.js";
import type { ObjectType } from "../ObjectType.js";
import { code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_toStringRecordFunction(this: ObjectType): Callable {
  const type = code`${this.reusables.snippets.ToStringRecordFunction}<${this.expression}>`;
  const unannotatedExpression = () =>
    code`(${this.thisVariable}) => ${this.reusables.snippets.compactRecord}({${joinCode(
      this.properties.flatMap((property) =>
        property
          .toStringInitializer({
            variables: {
              object: this.thisVariable,
            },
          })
          .toList(),
      ),
      { on: "," },
    )}})`;

  return this.name
    .map<Callable>(
      (name) =>
        new DeclaredCallable({
          qualifiedName: [name, "toStringRecord"],
          type,
          unannotatedExpression,
        }),
    )
    .orDefault(new InlineCallable(unannotatedExpression, { type }));
}
