import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractType } from "./AbstractType.js";
import { AbstractUnionType } from "./AbstractUnionType.js";
import type { TsFeature } from "./TsFeature.js";
import type { Type } from "./Type.js";
import { type Code, code, def, joinCode } from "./ts-poet-wrapper.js";

export abstract class AbstractNamedUnionType<
  MemberTypeT extends Type,
> extends AbstractUnionType<MemberTypeT> {
  protected readonly _name: string;

  readonly features: ReadonlySet<TsFeature>;

  constructor({
    features,
    name,
    ...superParameters
  }: {
    features: ReadonlySet<TsFeature>;
    name: string;
  } & ConstructorParameters<typeof AbstractUnionType<MemberTypeT>>[0]) {
    super(superParameters);
    this.features = features;
    this._name = name;
  }

  @Memoize()
  get declaration(): Maybe<Code> {
    const declarations: Code[] = [
      code`export type ${def(this._name)} = ${this.inlineName};`,
    ];

    const staticModuleDeclarations = Object.entries(
      this.staticModuleDeclarations,
    );
    if (staticModuleDeclarations.length > 0) {
      declarations.push(code`\
export namespace ${def(this.name)} {
${joinCode(
  staticModuleDeclarations
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map((_) => _[1]),
  { on: "\n\n" },
)}
}`);
    }

    return Maybe.of(joinCode(declarations, { on: "\n\n" }));
  }

  @Memoize()
  override get equalsFunction(): Code {
    if (this.features.has("equals")) {
      return code`${this.name}.equals`;
    }
    return this.inlineEqualsFunction;
  }

  @Memoize()
  override get filterFunction(): Code {
    return code`${this.name}.filter`;
  }

  @Memoize()
  get filterType(): Code {
    return code`${this.name}.Filter`;
  }

  get jsonSchemaFunctionDeclaration(): Code {
    const meta: Record<string, string> = {
      // id: this.name,
    };
    this.comment.ifJust((description) => {
      meta["description"] = description;
    });
    this.label.ifJust((label) => {
      meta["title"] = label;
    });

    return code`export const schema = () => ${this.inlineJsonSchema}.meta(${meta});`;
  }

  get jsonTypeAliasDeclaration(): Code {
    return code`export type Json = ${this.inlineJsonType.name}`;
  }

  @Memoize()
  override get name(): string {
    return this._name;
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Code {
    if (this.features.has("sparql")) {
      return code`${this.name}.valueSparqlConstructTriples`;
    }
    return this.inlineValueSparqlConstructTriplesFunction;
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    if (this.features.has("sparql")) {
      return code`${this.name}.valueSparqlWherePatterns`;
    }
    return this.inlineValueSparqlWherePatternsFunction;
  }

  protected get staticModuleDeclarations(): Record<string, Code> {
    const staticModuleDeclarations: Record<string, Code> = {};

    if (this.features.has("equals")) {
      staticModuleDeclarations[`equals`] =
        code`export const equals = ${this.inlineEqualsFunction};`;
    }

    staticModuleDeclarations[`Filter`] =
      code`export type Filter = ${this.inlineFilterType};`;
    staticModuleDeclarations[`filter`] =
      code`export const filter = ${this.inlineFilterFunction};`;

    if (this.features.has("hash")) {
      staticModuleDeclarations[`hash`] =
        code`export function hash<HasherT extends ${this.reusables.snippets.Hasher}>(value: ${this._name}, hasher: HasherT): HasherT { ${this.inlineHashStatements({ depth: 0, variables: { hasher: code`hasher`, value: code`value` } })} return hasher; }`;
    }

    if (this.features.has("json")) {
      staticModuleDeclarations[`Json`] = code`\
${this.jsonTypeAliasDeclaration}

export namespace Json {
  ${this.jsonSchemaFunctionDeclaration}

  export function parse(json: unknown): ${this.reusables.imports.Either}<Error, Json> {
    const jsonSafeParseResult = schema().safeParse(json);
    if (!jsonSafeParseResult.success) { return ${this.reusables.imports.Left}(jsonSafeParseResult.error); }
    return ${this.reusables.imports.Right}(jsonSafeParseResult.data);
  }
}`;

      staticModuleDeclarations[`fromJson`] =
        code`export const fromJson = ${this.inlineFromJsonFunction};`;

      staticModuleDeclarations[`toJson`] =
        code`export const toJson = ${this.inlineToJsonFunction};`;
    }

    if (this.features.has("rdf")) {
      staticModuleDeclarations[`fromRdfResourceValues`] =
        code`export const fromRdfResourceValues: ${this.reusables.snippets.FromRdfResourceValuesFunction}<${this.name}> = ${this.inlineFromRdfResourceValuesFunction};`;

      staticModuleDeclarations[`toRdfResourceValues`] =
        code`export const toRdfResourceValues = ${this.inlineToRdfResourceValuesFunction};`;
    }

    if (this.features.has("sparql")) {
      staticModuleDeclarations[`valueSparqlConstructTriples`] =
        code`export const valueSparqlConstructTriples: ${this.reusables.snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}> = ${this.inlineValueSparqlConstructTriplesFunction};`;

      staticModuleDeclarations[`valueSparqlWherePatterns`] =
        code`export const valueSparqlWherePatterns: ${this.reusables.snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}> = ${this.inlineValueSparqlWherePatternsFunction};`;
    }

    const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
    staticModuleDeclarations[`${syntheticNamePrefix}toString`] =
      code`export const ${syntheticNamePrefix}toString = ${this.inlineToStringFunction};`;

    return staticModuleDeclarations;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): Code {
    if (this.features.has("json")) {
      return code`${this.name}.fromJson(${variables.value})`;
    }
    return code`${this.inlineFromJsonFunction}(${variables.value})`;
  }

  override fromRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["fromRdfResourceValuesExpression"]>[0]): Code {
    const { resourceValues: resourceValuesVariable, ...otherVariables } =
      variables;
    if (this.features.has("rdf")) {
      return code`${this.name}.fromRdfResourceValues(${resourceValuesVariable}, ${otherVariables})`;
    }
    return code`${this.inlineFromRdfResourceValuesFunction}(${resourceValuesVariable}, ${otherVariables})`;
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<AbstractType["hashStatements"]>[0]): readonly Code[] {
    if (this.features.has("hash")) {
      return [
        code`${this.name}.hash(${variables.value}, ${variables.hasher});`,
      ];
    }
    return this.inlineHashStatements({ depth, variables });
  }

  override jsonSchema({
    context,
  }: Parameters<AbstractType["jsonSchema"]>[0]): Code {
    if (this.features.has("json")) {
      const expression = code`${this.name}.Json.schema()`;
      if (context === "property" && this.recursive) {
        return code`${this.reusables.imports.z}.lazy((): ${this.reusables.imports.z}.ZodType<${this.name}.Json> => ${expression})`;
      }
      return expression;
    }
    return this.inlineJsonSchema;
  }

  @Memoize()
  override jsonType(): AbstractType.JsonType {
    if (this.features.has("json")) {
      return new AbstractType.JsonType(`${this.name}.Json`);
    }
    return this.inlineJsonType;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): Code {
    if (this.features.has("json")) {
      return code`${this.name}.toJson(${variables.value})`;
    }
    return code`${this.inlineToJsonFunction}(${variables.value})`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["toRdfResourceValuesExpression"]>[0]): Code {
    const { value: valueVariable, ...otherVariables } = variables;
    if (this.features.has("rdf")) {
      return code`${this.name}.toRdfResourceValues(${valueVariable}, ${otherVariables})`;
    }
    return code`${this.inlineToRdfResourceValuesFunction}(${valueVariable}, ${otherVariables})`;
  }

  override toStringExpression({
    variables,
  }: Parameters<AbstractType["toStringExpression"]>[0]): Code {
    return code`${this.name}.${this.configuration.syntheticNamePrefix}toString(${variables.value})`;
  }
}
