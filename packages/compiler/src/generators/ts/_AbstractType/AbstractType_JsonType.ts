import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import type { Reusables } from "../Reusables.js";
import type { TsGenerator } from "../TsGenerator.js";
import {
  arrayOf,
  type Code,
  code,
  joinCode,
  literalOf,
} from "../ts-poet-wrapper.js";

abstract class AbstractJsonType {
  protected readonly configuration: TsGenerator.Configuration;
  protected abstract readonly inlineExpression: Code;
  protected readonly reusables: Reusables;
  protected abstract readonly schemaExpression: Code;

  abstract readonly kind: string;
  readonly name: Maybe<AbstractJsonType.Name>;

  constructor({
    configuration,
    name,
    reusables,
  }: {
    configuration: TsGenerator.Configuration;
    name: Maybe<AbstractJsonType.Name>;
    reusables: Reusables;
  }) {
    this.configuration = configuration;
    this.name = name;
    this.reusables = reusables;
  }

  @Memoize()
  get declaration(): Maybe<Code> {
    if (this.name.isNothing()) {
      return Maybe.empty();
    }

    const unqualifiedName = this.name.extract()!.at(-1)!;

    const declarations: Code[] = [];

    if (this.configuration.features.has("Object.JSON.type")) {
      declarations.push(
        code`export type ${unqualifiedName} = ${this.inlineExpression};`,
      );
    }

    const moduleDeclarations: Code[] = [];

    if (this.configuration.features.has("Object.JSON.schema")) {
      moduleDeclarations.push(
        code`export function schema() { return ${this.schemaExpression} satisfies ${this.reusables.imports.z}.ZodType<Json>; }`,
      );
    }

    if (moduleDeclarations.length > 0) {
      declarations.push(
        code`export namespace Json { ${joinCode(moduleDeclarations, { on: "\n\n" })} }`,
      );
    }

    return Maybe.of(joinCode(declarations, { on: "\n\n" }));
  }

  @Memoize()
  get expression(): Code {
    return this.name
      .map((name) => code`${name.join(".")}`)
      .orDefaultLazy(() => this.inlineExpression);
  }

  @Memoize()
  get schema(): Code {
    return this.name
      .map((name) => code`${name.join(".")}.schema()`)
      .orDefaultLazy(() => this.schemaExpression);
  }

  uiSchemaElement(_parameters: {
    variables: { scopePrefix: Code };
  }): Maybe<Code> {
    return Maybe.empty();
  }
}

class JsonArrayType extends AbstractJsonType {
  readonly itemType: JsonArrayType.ItemType;
  override readonly kind = "JsonArray";
  readonly minCount: bigint;

  constructor({
    itemType,
    minCount,
    ...superParameters
  }: {
    itemType: JsonArrayType.ItemType;
    minCount: bigint;
  } & ConstructorParameters<typeof AbstractJsonType>[0]) {
    super(superParameters);
    this.itemType = itemType;
    this.minCount = minCount;
  }

  @Memoize()
  protected get inlineExpression(): Code {
    return code`(${this.itemType.expression})[]`;
  }

  @Memoize()
  protected get schemaExpression(): Code {
    return code`${this.reusables.imports.z}.array(${this.itemType.schema})`;
  }
}

class JsonBooleanType extends AbstractJsonType {
  override readonly kind = "JsonBoolean";

  @Memoize()
  protected get inlineExpression(): Code {
    return code`boolean`;
  }

  @Memoize()
  protected get schemaExpression(): Code {
    return code`${this.reusables.imports.z}.boolean()`;
  }
}

class JsonNumberType extends AbstractJsonType {
  override readonly kind = "JsonNumber";

  @Memoize()
  protected get inlineExpression(): Code {
    return code`number`;
  }

  @Memoize()
  protected get schemaExpression(): Code {
    return code`${this.reusables.imports.z}.number()`;
  }
}

class JsonObjectType extends AbstractJsonType {
  override readonly kind = "JsonObject";
  readonly members: readonly JsonObjectType.Member[];

  constructor({
    members,
    ...superParameters
  }: {
    members: readonly JsonObjectType.Member[];
  } & ConstructorParameters<typeof AbstractJsonType>[0]) {
    super(superParameters);
    this.members = members;
  }

  override uiSchemaElement({
    variables,
  }: Parameters<AbstractJsonType["uiSchemaElement"]>[0]): Maybe<Code> {
    return Maybe.of(
      code`${this.name
        .map((name) => code`${name.join(".")}.uiSchema`)
        .orDefaultLazy(
          () => this.uiSchemaFunctionExpression,
        )}({ scopePrefix: ${variables.scopePrefix} })`,
    );
  }

  private get uiSchemaFunctionExpression() {
    const variables = { scopePrefix: code`scopePrefix` };

    const uiSchema: Record<string, Code | string> = {
      elements: code`${arrayOf(
        ...this.members.flatMap((member) =>
          member.uiSchemaElement.map((f) => f({ variables })).toList(),
        ),
      )}`,
      type: "Group",
    };
    this.name.ifJust((name) => {
      uiSchema["label"] = code`${literalOf(name)}`;
    });

    return code`\
((parameters?: { scopePrefix?: string }): any => {
  const scopePrefix = parameters?.scopePrefix ?? "#";
  return ${uiSchema};
})`;
  }

  @Memoize()
  protected get inlineExpression(): Code {
    return code`{ ${joinCode(
      this.members.map((member) => {
        return code`"${member.name}"${member.optional ? "?" : ""}: ${member.type.expression}`;
      }),
      { on: ", " },
    )} }`;
  }

  @Memoize()
  protected get schemaExpression(): Code {
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

class JsonStringType extends AbstractJsonType {
  private readonly in_: readonly string[];
  private readonly minLength: Maybe<bigint>;

  override readonly kind = "JsonString";

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
  protected get inlineExpression(): Code {
    if (this.in_.length > 0) {
      return joinCode(
        this.in_.map((value) => code`${literalOf(value)}`),
        { on: " | " },
      );
    }
    return code`string`;
  }

  @Memoize()
  protected get schemaExpression(): Code {
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
  private readonly constructorParameters: {
    configuration: TsGenerator.Configuration;
    reusables: Reusables;
  };

  constructor(constructorParameters: {
    configuration: TsGenerator.Configuration;
    reusables: Reusables;
  }) {
    this.constructorParameters = constructorParameters;
  }

  array(parameters: {
    itemType: JsonType;
    minCount: bigint;
    name: Maybe<AbstractJsonType.Name>;
  }): JsonArrayType {
    return new JsonArrayType({
      ...this.constructorParameters,
      ...parameters,
    });
  }

  object(parameters: {
    members: readonly JsonObjectType.Member[];
    name: Maybe<AbstractJsonType.Name>;
  }): JsonObjectType {
    return new JsonObjectType({
      ...this.constructorParameters,
      ...parameters,
    });
  }

  string(parameters: {
    in_: readonly string[];
    minLength: Maybe<bigint>;
    name: Maybe<AbstractJsonType.Name>;
  }): JsonStringType {
    return new JsonStringType({
      ...this.constructorParameters,
      ...parameters,
    });
  }
}

type JsonType =
  | JsonArrayType
  | JsonBooleanType
  | JsonNumberType
  | JsonObjectType
  | JsonStringType;

export type AbstractType_JsonType = JsonType;

export type AbstractType_JsonTypeFactory = JsonTypeFactory;

export namespace AbstractJsonType {
  export type Name = readonly string[];
}

export const AbstractType_JsonTypeFactory = JsonTypeFactory;

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
    readonly optional: boolean;
    readonly recursive: boolean;
    readonly type: AbstractType_JsonType;

    /**
     * Element object (usually a control https://jsonforms.io/docs/uischema/controls) for a JSON Forms UI schema.
     */
    readonly uiSchemaElement: Maybe<
      (parameters: { variables: { scopePrefix: Code } }) => Code
    >;
  }
}
