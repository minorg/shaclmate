import { Memoize } from "typescript-memoize";
import type { Reusables } from "../Reusables.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export class AbstractType_GraphqlType {
  /**
   * Is the type nullable in GraphQL?
   */
  readonly nullable: boolean;

  /**
   * The expression of the type when it's nullable -- so it should never include "new graphql.GraphQLNonNull(...)" around it.
   */
  readonly nullableExpression: Code;

  private readonly reusables: Reusables;

  constructor(
    nullableExpression: Code,
    reusables: Reusables,
    options?: { nullable: boolean },
  ) {
    this.nullable = !!options?.nullable;
    this.nullableExpression = nullableExpression;
    this.reusables = reusables;
  }

  @Memoize()
  get expression(): Code {
    return this.nullable
      ? this.nullableExpression
      : code`new ${this.reusables.imports.GraphQLNonNull}(${this.nullableExpression})`;
  }
}
