import type { Literal, NamedNode } from "@rdfjs/types";
import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type * as input from "../input/index.js";

export class ShapeStack {
  private readonly stack: input.Shape[] = [];

  constructor() {
    const stack = this.stack;
    this.constraints = {
      get hasValues(): readonly (Literal | NamedNode)[] {
        for (const shape of stack.toReversed()) {
          if (shape.constraints.hasValues.length > 0) {
            return shape.constraints.hasValues;
          }
        }
        return [];
      },
      get in_(): readonly (Literal | NamedNode)[] {
        for (const shape of stack.toReversed()) {
          if (shape.constraints.in_.length > 0) {
            return shape.constraints.in_;
          }
        }
        return [];
      },
    };
  }

  readonly constraints: {
    readonly hasValues: readonly (Literal | NamedNode)[];
    readonly in_: readonly (Literal | NamedNode)[];
  };

  get defaultValue(): Maybe<Literal | NamedNode> {
    for (const shape of this.stack.toReversed()) {
      if (shape.kind !== "PropertyShape") {
        continue;
      }
      if (shape.defaultValue.isJust()) {
        return shape.defaultValue;
      }
    }
    return Maybe.empty();
  }

  pop(shape: input.Shape): this {
    const poppedShape = this.stack.pop();
    invariant(poppedShape, "stack is empty");
    invariant(
      Object.is(poppedShape, shape),
      "tried to pop wrong shape from stack",
    );
    return this;
  }

  push(shape: input.Shape): this {
    invariant(
      !this.stack.some((stackShape) => Object.is(stackShape, shape)),
      "shape already on stack",
    );
    this.stack.push(shape);
    return this;
  }
}
