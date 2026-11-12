import type { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import type { Snippet } from "./Snippet.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

/**
 * Runtime schema/metadata objects for types and properties.
 */
export class SchemaObject {
  /**
   * Object literal properties, usually property assignments like name: value without a terminating comma.
   */
  readonly properties: readonly Code[];

  /**
   * Type of the schema object.
   */
  readonly type: SchemaObject.Type;

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
    type: SchemaObject.Type;
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
}

export namespace SchemaObject {
  export class ObjectType {
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
      return code`{ ${joinCode(this.members.concat(), { on: ", " })} }`;
    }
  }

  export class ReferenceType {
    readonly expression: Code;

    constructor(reference: Code | Snippet) {
      this.expression = code`${reference}`;
    }
  }
}
