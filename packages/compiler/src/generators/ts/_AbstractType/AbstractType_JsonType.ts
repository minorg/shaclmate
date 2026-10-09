import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import type { Reusables } from "../Reusables.js";
import {
  arrayOf,
  type Code,
  code,
  joinCode,
  literalOf,
} from "../ts-poet-wrapper.js";

abstract class AbstractJsonType {
  protected readonly reusables: Reusables;

  abstract readonly expression: Code;
  abstract readonly kind: string;
  abstract readonly schema: Code;

  constructor({ reusables }: { reusables: Reusables }) {
    this.reusables = reusables;
  }
}

class JsonArrayType extends AbstractJsonType {
  readonly itemType: JsonArrayType.ItemType;
  override readonly kind = "JsonArray";
  readonly minCount: Maybe<bigint>;

  constructor({
    itemType,
    minCount,
    ...superParameters
  }: {
    itemType: JsonArrayType.ItemType;
    minCount: Maybe<bigint>;
  } & ConstructorParameters<typeof AbstractJsonType>[0]) {
    super(superParameters);
    this.itemType = itemType;
    this.minCount = minCount;
  }

  @Memoize()
  get expression(): Code {
    return code`(${this.itemType.expression})[]`;
  }

  @Memoize()
  get schema(): Code {
    return code`${this.reusables.imports.z}.array(${this.itemType.schema})`;
  }
}

class JsonBooleanType extends AbstractJsonType {
  override readonly kind = "JsonBoolean";

  @Memoize()
  get expression(): Code {
    return code`boolean`;
  }

  @Memoize()
  get schema(): Code {
    return code`${this.reusables.imports.z}.boolean()`;
  }
}

class JsonNumberType extends AbstractJsonType {
  override readonly kind = "JsonNumber";

  @Memoize()
  get expression(): Code {
    return code`number`;
  }

  @Memoize()
  get schema(): Code {
    return code`${this.reusables.imports.z}.number()`;
  }
}

class JsonObjectType extends AbstractJsonType {
  override readonly kind = "JsonObject";
  readonly alias: Maybe<Code>;
  readonly members: readonly JsonObjectType.Member[];

  constructor({
    alias,
    members,
    ...superParameters
  }: {
    alias: Maybe<Code>;
    members: readonly JsonObjectType.Member[];
  } & ConstructorParameters<typeof AbstractJsonType>[0]) {
    super(superParameters);
    this.alias = alias;
    this.members = members;
  }

  @Memoize()
  get expression(): Code {
    return this.alias.orDefaultLazy(() => this.inlineExpression);
  }

  @Memoize()
  get inlineExpression(): Code {
    return code`{ ${joinCode(
      this.members.map((member) => {
        if (member.type.kind === "JsonOption") {
          return code`"${member.name}"?: ${member.type.itemType.expression}`;
        }
        return code`"${member.name}": ${member.type.expression}`;
      }),
      { on: ", " },
    )} }`;
  }

  @Memoize()
  get schema(): Code {
    return code`${this.reusables.imports.z}.object({ ${joinCode(
      this.members.map((member) => {
        let schema = member.type.schema;

        const meta: Record<string, string> = {
          // id: `${this.namedObjectType.name}-${this.name}`, // id's must be unique
        };
        member.description.ifJust((description) => {
          meta["description"] = description;
        });
        member.label.ifJust((label) => {
          meta["title"] = label;
        });
        if (Object.keys(meta).length > 0) {
          schema = code`${schema}.meta(${meta})`;
        }

        return code`${member.name}: ${schema}`;
      }),
      { on: ", " },
    )} })`;
  }
}

class JsonOptionType extends AbstractJsonType {
  readonly itemType: JsonOptionType.ItemType;
  override readonly kind = "JsonOption";

  constructor({
    itemType,
    ...superParameters
  }: { itemType: JsonOptionType.ItemType } & ConstructorParameters<
    typeof AbstractJsonType
  >[0]) {
    super(superParameters);
    this.itemType = itemType;
  }

  @Memoize()
  get expression(): Code {
    throw new Error("should never be called");
  }

  @Memoize()
  get schema(): Code {
    return code`${this.itemType.schema}.optional()`;
  }
}

class JsonStringType extends AbstractJsonType {
  override readonly kind = "JsonString";
  private readonly in_: readonly string[];
  private readonly minLength: Maybe<bigint>;

  constructor({
    in_,
    minLength,
    ...superParameters
  }: {
    in_: readonly string[];
    minLength: Maybe<bigint>;
  } & ConstructorParameters<typeof AbstractJsonType>[0]) {
    super(superParameters);
    this.in_ = in_;
    this.minLength = minLength;
  }

  @Memoize()
  get expression(): Code {
    if (this.in_.length > 0) {
      return joinCode(
        this.in_.map((value) => code`${literalOf(value)}`),
        { on: " | " },
      );
    }
    return code`string`;
  }

  @Memoize()
  get schema(): Code {
    switch (this.in_.length) {
      case 0: {
        let schema = code`${this.reusables.imports.z}.string()`;
        this.minLength.ifJust((minLength) => {
          schema = code`${schema}.min(${minLength})`;
        });
        return schema;
      }
      case 1:
        return code`${this.reusables.imports.z}.literal(${literalOf(this.in_[0])})`;
      default:
        return code`${this.reusables.imports.z}.enum(${arrayOf(this.in_)})`;
    }
  }
}

class JsonTypeFactory {
  private readonly constructorParameters: { reusables: Reusables };

  constructor({ reusables }: { reusables: Reusables }) {
    this.constructorParameters = { reusables };
  }

  array(itemType: JsonType, options?: { minCount?: bigint }): JsonArrayType {
    if (itemType.kind === "JsonOption") {
      throw new RangeError(`${itemType.kind} not permitted in an array`);
    }
    return new JsonArrayType({
      ...this.constructorParameters,
      itemType,
      minCount: Maybe.fromNullable(options?.minCount),
    });
  }

  object({
    alias,
    members,
  }: {
    alias: Maybe<Code>;
    members: readonly JsonObjectType.Member[];
  }): JsonObjectType {
    return new JsonObjectType({
      ...this.constructorParameters,
      alias,
      members,
    });
  }

  option(itemType: JsonType): JsonOptionType {
    if (itemType.kind === "JsonOption") {
      throw new RangeError(`${itemType.kind} not permitted in an option`);
    }
    return new JsonOptionType({ ...this.constructorParameters, itemType });
  }

  string(parameters?: {
    in_?: readonly string[];
    minLength?: bigint;
  }): JsonStringType {
    return new JsonStringType({
      ...this.constructorParameters,
      in_: parameters?.in_ ?? [],
      minLength: Maybe.fromNullable(parameters?.minLength),
    });
  }
}

type JsonType =
  | JsonArrayType
  | JsonBooleanType
  | JsonNumberType
  | JsonObjectType
  | JsonOptionType
  | JsonStringType;

export type AbstractType_JsonType = JsonType;

export const AbstractType_JsonTypeFactory = JsonTypeFactory;
export type AbstractType_JsonTypeFactory = JsonTypeFactory;

// biome-ignore lint/correctness/noUnusedVariables: used for types
namespace JsonArrayType {
  export type ItemType =
    | JsonArrayType
    | JsonBooleanType
    | JsonObjectType
    | JsonNumberType
    | JsonStringType;
}

// biome-ignore lint/correctness/noUnusedVariables: used for types
namespace JsonObjectType {
  export interface Member {
    readonly description: Maybe<string>;
    readonly label: Maybe<string>;
    readonly name: string;
    readonly recursive: boolean;
    readonly type: AbstractType_JsonType;
  }
}

// biome-ignore lint/correctness/noUnusedVariables: used for types
namespace JsonOptionType {
  export type ItemType =
    | JsonArrayType
    | JsonBooleanType
    | JsonNumberType
    | JsonObjectType
    | JsonStringType;
}
