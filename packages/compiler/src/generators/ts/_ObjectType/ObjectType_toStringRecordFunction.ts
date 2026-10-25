import type { Callable } from "../Callable.js";
import type { ObjectType } from "../ObjectType.js";
import { code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_toStringRecordFunction(this: ObjectType): Callable {
  return this._function({
    type: code`${this.reusables.snippets.ToStringRecordFunction}<${this.propertySubsetExpression(
      (property) =>
        property
          .toStringInitializer({ variables: { object: code`object` } })
          .isJust(),
    )}>`,
    unannotatedExpression: () =>
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
      )}})`,
    unqualifiedName: "toStringRecord",
  });
}
