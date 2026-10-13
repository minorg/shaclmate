import type { NamedNode } from "@rdfjs/types";

import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
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

    if (this.configuration.features.has("Object.JSON.parse")) {
      moduleDeclarations.push(code`\
export function parse(json: unknown): ${this.reusables.imports.Either}<Error, ${unqualifiedName}> {
  const jsonSafeParseResult = schema().safeParse(json);
  if (!jsonSafeParseResult.success) { return ${this.reusables.imports.Left}(jsonSafeParseResult.error); }
  return ${this.reusables.imports.Right}(jsonSafeParseResult.data);
}`);
    }

    if (moduleDeclarations.length > 0) {
      declarations.push(
        code`export namespace Json { ${joinCode(moduleDeclarations, { on: "\n\n" })} }`,
      );
    }

    if (declarations.length === 0) {
      return Maybe.empty();
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

abstract class AbstractJsonPrimitiveType<
  PrimitiveT extends boolean | number | string,
> extends AbstractJsonType {
  protected readonly inReference: Maybe<Code>;
  protected readonly in_: readonly PrimitiveT[];
  protected abstract readonly typeof: "boolean" | "number" | "string";

  constructor({
    in_,
    inReference,
    ...superParameters
  }: {
    in_: readonly PrimitiveT[];
    inReference: Maybe<Code>;
  } & ConstructorParameters<typeof AbstractJsonType>[0]) {
    super(superParameters);
    this.in_ = in_;
    this.inReference = inReference;
  }

  @Memoize()
  protected get inlineExpression(): Code {
    if (this.in_.length > 0) {
      return joinCode(
        this.in_.map((value) => code`${literalOf(value)}`),
        { on: " | " },
      );
    }
    return code`${this.typeof}`;
  }

  @Memoize()
  protected get schemaExpression(): Code {
    switch (this.in_.length) {
      case 0: {
        return code`${this.reusables.imports.z}.${this.typeof}()`;
      }
      case 1:
        return code`${this.reusables.imports.z}.literal(${literalOf(this.in_[0])})`;
      default:
        return code`${this.reusables.imports.z}.enum(${this.inReference.orDefault(code`${arrayOf(this.in_)}`)})`;
    }
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

class JsonBooleanType extends AbstractJsonPrimitiveType<boolean> {
  override readonly kind = "JsonBoolean";
  protected override readonly typeof = "boolean";
}

class JsonDiscriminatedUnionType extends AbstractJsonType {
  override readonly kind = "JsonDiscriminatedUnion";
  readonly memberTypes: readonly JsonObjectType[];

  constructor({
    memberTypes,
    ...superParameters
  }: {
    memberTypes: readonly JsonObjectType[];
  } & ConstructorParameters<typeof AbstractJsonType>[0]) {
    super(superParameters);
    this.memberTypes = memberTypes;
  }

  @Memoize()
  protected get inlineExpression(): Code {
    return code`(${joinCode(
      this.memberTypes.map((memberType) => memberType.expression),
      { on: " | " },
    )}`;
  }

  @Memoize()
  protected get schemaExpression(): Code {
    return code`${this.reusables.imports.z}.discriminatedUnion(${literalOf(this.configuration.objectDiscriminantProperty.jsonName)}, [${joinCode(this.memberTypes.map((memberType) => memberType.schema))}])`;
  }
}

class JsonNumberType extends AbstractJsonPrimitiveType<number> {
  override readonly kind = "JsonNumber";
  protected override readonly typeof = "number";
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

        return code`${literalOf(member.name)}: ${schema}`;
      }),
      { on: ", " },
    )} })`;
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
}

class JsonStringType extends AbstractJsonPrimitiveType<string> {
  private readonly format: Maybe<JsonStringType.Format>;
  private readonly minLength: Maybe<bigint>;

  protected override readonly typeof = "string";

  override readonly kind = "JsonString";

  constructor({
    format,
    minLength,
    ...superParameters
  }: {
    format: Maybe<JsonStringType.Format>;
    in_: readonly string[];
    inReference: Maybe<Code>;
    minLength: Maybe<bigint>;
  } & ConstructorParameters<typeof AbstractJsonPrimitiveType<string>>[0]) {
    super(superParameters);
    this.format = format;
    this.minLength = minLength;
  }

  @Memoize()
  protected override get schemaExpression(): Code {
    switch (this.in_.length) {
      case 0: {
        return this.format
          .map((format) => {
            invariant(this.minLength.isNothing());
            switch (format) {
              case "date":
                return code`${this.reusables.imports.z}.iso.date()`;
              case "datetime":
                return code`${this.reusables.imports.z}.iso.datetime()`;
              default:
                format satisfies never;
                throw new RangeError(format);
            }
          })
          .orDefaultLazy(() => {
            let schema = code`${this.reusables.imports.z}.string()`;
            this.minLength.ifJust((minLength) => {
              schema = code`${schema}.min(${minLength})`;
            });
            return schema;
          });
      }
      case 1:
        invariant(this.format.isNothing());
        return code`${this.reusables.imports.z}.literal(${literalOf(this.in_[0])})`;
      default:
        invariant(this.format.isNothing());
        return code`${this.reusables.imports.z}.enum(${this.inReference.orDefault(code`${arrayOf(this.in_)}`)})`;
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

  createJsonArrayType(
    itemType: JsonArrayType.ItemType,
    options?: {
      minCount?: bigint;
      name?: AbstractJsonType.Name;
    },
  ): JsonArrayType {
    return new JsonArrayType({
      ...this.constructorParameters,
      itemType,
      minCount: options?.minCount ?? 0n,
      name: Maybe.fromNullable(options?.name),
    });
  }

  createJsonBooleanType(parameters?: {
    in_?: readonly boolean[];
    inReference?: Code;
    name?: AbstractJsonType.Name;
  }): JsonBooleanType {
    return new JsonBooleanType({
      ...this.constructorParameters,
      in_: parameters?.in_ ?? [],
      inReference: Maybe.fromNullable(parameters?.inReference),
      name: Maybe.fromNullable(parameters?.name),
    });
  }

  createJsonDiscriminatedUnionType(
    memberTypes: readonly JsonObjectType[],
    options?: {
      name?: AbstractJsonType.Name;
    },
  ): JsonDiscriminatedUnionType {
    return new JsonDiscriminatedUnionType({
      ...this.constructorParameters,
      memberTypes,
      name: Maybe.fromNullable(options?.name),
    });
  }

  createJsonNumberType(parameters?: {
    in_?: readonly number[];
    inReference?: Code;
    name?: AbstractJsonType.Name;
  }): JsonNumberType {
    return new JsonNumberType({
      ...this.constructorParameters,
      in_: parameters?.in_ ?? [],
      inReference: Maybe.fromNullable(parameters?.inReference),
      name: Maybe.fromNullable(parameters?.name),
    });
  }

  createJsonObjectType(
    partialMembers:
      | readonly JsonObjectType.PartialMember[]
      | Record<string, Omit<JsonObjectType.PartialMember, "name">>,
    options?: {
      name?: AbstractJsonType.Name;
    },
  ): JsonObjectType {
    let partialMembersArray: readonly JsonObjectType.PartialMember[];
    if (Array.isArray(partialMembers)) {
      partialMembersArray = partialMembers;
    } else {
      partialMembersArray = Object.entries(partialMembers).map(
        ([name, partialMember]) => ({ ...partialMember, name }),
      ) satisfies readonly JsonObjectType.PartialMember[];
    }

    return new JsonObjectType({
      ...this.constructorParameters,
      members: partialMembersArray.map((member) => ({
        description: Maybe.isMaybe(member.description)
          ? member.description
          : Maybe.fromNullable(member.description),
        label: Maybe.isMaybe(member.label)
          ? member.label
          : Maybe.fromNullable(member.label),
        optional: !!member.optional,
        recursive: !!member.recursive,
        name: member.name,
        type: member.type,
        uiSchemaElement: Maybe.isMaybe(member.uiSchemaElement)
          ? member.uiSchemaElement
          : Maybe.fromNullable(member.uiSchemaElement),
      })),
      name: Maybe.fromNullable(options?.name),
    });
  }

  createJsonStringType(parameters?: {
    format?: JsonStringType.Format;
    in_?: readonly string[];
    inReference?: Code;
    minLength?: bigint;
    name?: AbstractJsonType.Name;
  }): JsonStringType {
    return new JsonStringType({
      ...this.constructorParameters,
      format: Maybe.fromNullable(parameters?.format),
      in_: parameters?.in_ ?? [],
      inReference: Maybe.fromNullable(parameters?.inReference),
      minLength: Maybe.fromNullable(parameters?.minLength),
      name: Maybe.fromNullable(parameters?.name),
    });
  }

  createJsonValueObjectType(members: {
    "@type": NamedNode;
    "@value": JsonType;
  }): JsonObjectType {
    return this.createJsonObjectType({
      "@type": {
        type: this.createJsonStringType({
          in_: [members["@type"].value],
        }),
      },
      "@value": {
        type: members["@value"],
      },
    });
  }
}

type JsonType =
  | JsonArrayType
  | JsonBooleanType
  | JsonDiscriminatedUnionType
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
    | JsonDiscriminatedUnionType
    | JsonObjectType
    | JsonNumberType
    | JsonStringType;
}

// biome-ignore lint/correctness/noUnusedVariables: used for types
namespace JsonObjectType {
  type MemberUiSchemaElementFunction = (parameters: {
    variables: { scopePrefix: Code };
  }) => Code;

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
    readonly uiSchemaElement: Maybe<MemberUiSchemaElementFunction>;
  }

  export type PartialMember = Pick<JsonObjectType.Member, "name" | "type"> & {
    description?: Maybe<string> | string;
    label?: Maybe<string> | string;
    optional?: boolean;
    recursive?: boolean;
    uiSchemaElement?:
      | Maybe<MemberUiSchemaElementFunction>
      | MemberUiSchemaElementFunction;
  };
}

// biome-ignore lint/correctness/noUnusedVariables: used for types
namespace JsonStringType {
  export type Format = "date" | "datetime";
}
