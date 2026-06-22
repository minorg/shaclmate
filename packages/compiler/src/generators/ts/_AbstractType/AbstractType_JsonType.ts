import { Memoize } from "typescript-memoize";
import { type Code, code } from "../ts-poet-wrapper.js";

export class AbstractType_JsonType {
  /**
   * Is the type optional in JSON? Equivalent to ? in TypeScript or | undefined.
   */
  readonly optional: boolean;

  /**
   * The expression of the type when it's required i.e. -- so it should never include "| undefined".
   */
  readonly requiredExpression: Code;

  constructor(
    requiredExpression: Code,
    parameters?: {
      optional: boolean;
    },
  ) {
    this.optional = !!parameters?.optional;
    this.requiredExpression = requiredExpression;
  }

  @Memoize()
  get expression(): Code {
    return this.optional
      ? code`(${this.requiredExpression}) | undefined`
      : this.requiredExpression;
  }
}
