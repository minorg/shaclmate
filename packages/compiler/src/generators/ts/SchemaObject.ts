import type { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import type { Snippet } from "./Snippet.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

/**
 * Runtime schema/metadata objects for types and properties.
 */
export class SchemaObject<TypeT extends SchemaObject.Type> {
  /**
   * Object literal properties, usually property assignments like name: value without a terminating comma.
   */
  readonly properties: readonly Code[];

  /**
   * Type of the schema object.
   */
  readonly type: TypeT;

  /**
   * Variable pointing to the schema object.
   */
  readonly variable: Maybe<Code>;

  constructor({
    properties,
    type,
    variable,
  }: {
    properties: readonly Code[];
    type: TypeT;
    variable: Maybe<Code>;
  }) {
    this.properties = properties;
    this.type = type;
    this.variable = variable;
  }

  /**
   * Expression for this schema object, either the variable or a literal expression.
   */
  @Memoize()
  get expression(): Code {
    return this.variable.orDefault(this.literalExpression);
  }

  /**
   * Literal expression of the schema object e.g., { name1: value1, name2: value2 }
   */
  @Memoize()
  get literalExpression(): Code {
    return code`{ ${joinCode(this.properties.concat(), { on: ", " })} }`;
  }

  toString(): string {
    throw new Error("should never be called");
  }
}

export namespace SchemaObject {
  /**
   * Placeholder for abstract base classes.
   */
  export class AbstractType {
    constructor(private readonly ownerKind: string) {}

    get expression(): Code {
      throw new Error(
        `should never be called (instantiated by ${this.ownerKind})`,
      );
    }

    toString(): string {
      throw new Error("should never be called");
    }
  }

  /**
   * A built-in schema object type from a snippet or import.
   */
  export class BuiltinType {
    readonly expression: Code;

    constructor(expression: Code | Snippet) {
      this.expression = code`${expression}`;
    }

    toString(): string {
      throw new Error("should never be called");
    }
  }

  /**
   * A user-defined schema object type, typically corresponding to user-defined types.
   */
  export class UserDefinedType {
    /**
     * Members of the schema object type, usually property signatures like name: string.
     */
    readonly members: readonly Code[];

    /**
     * Name of the type, can be used in type annotations.
     */
    readonly name: Maybe<Code>;

    constructor({
      members,
      name,
    }: {
      members: readonly Code[];
      name: Maybe<Code>;
    }) {
      this.members = members;
      this.name = name;
    }

    /**
     * Expression of the schema object type, either the name or a literal expression.
     */
    @Memoize()
    get expression(): Code {
      return this.name.orDefault(this.literalExpression);
    }

    /**
     * Literal expression of the schema object type e.g., { name1: string, name2: string }.
     */
    @Memoize()
    get literalExpression(): Code {
      return code`{ ${joinCode(
        this.members.map((member) => code`${member};`),
      )} }`;
    }

    toString(): string {
      throw new Error("should never be called");
    }
  }

  export type Type = AbstractType | BuiltinType | UserDefinedType;
}
