import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import type { TsFeature } from "../../enums/TsFeature.js";
import { AbstractType } from "./AbstractType.js";
import { AbstractUnionType } from "./AbstractUnionType.js";
import { imports } from "./imports.js";
import { snippets } from "./snippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
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
export namespace ${def(this.staticModuleName)} {
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
      return code`${this.staticModuleName}.${syntheticNamePrefix}equals`;
    }
    return this.inlineEqualsFunction;
  }

  @Memoize()
  override get filterFunction(): Code {
    return code`${this.staticModuleName}.${syntheticNamePrefix}filter`;
  }

  @Memoize()
  get filterType(): Code {
    return code`${this.staticModuleName}.${syntheticNamePrefix}Filter`;
  }

  get jsonTypeAliasDeclaration(): Code {
    return code`export type ${syntheticNamePrefix}Json = ${this.inlineJsonType.name}`;
  }

  get jsonZodSchemaFunctionDeclaration(): Code {
    return code`export const ${syntheticNamePrefix}jsonZodSchema = () => ${this.inlineJsonZodSchema};`;
  }

  @Memoize()
  override get name(): string {
    return this._name;
  }

  get staticModuleName(): string {
    return this._name;
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Code {
    if (this.features.has("sparql")) {
      return code`${this.staticModuleName}.${syntheticNamePrefix}valueSparqlConstructTriples`;
    }
    return this.inlineValueSparqlConstructTriplesFunction;
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    if (this.features.has("sparql")) {
      return code`${this.staticModuleName}.${syntheticNamePrefix}valueSparqlWherePatterns`;
    }
    return this.inlineValueSparqlWherePatternsFunction;
  }

  protected get staticModuleDeclarations(): Record<string, Code> {
    const staticModuleDeclarations: Record<string, Code> = {};

    if (this.features.has("equals")) {
      staticModuleDeclarations[`${syntheticNamePrefix}equals`] =
        code`export const ${syntheticNamePrefix}equals = ${this.inlineEqualsFunction};`;
    }

    staticModuleDeclarations[`${syntheticNamePrefix}Filter`] =
      code`export type ${syntheticNamePrefix}Filter = ${this.inlineFilterType};`;
    staticModuleDeclarations[`${syntheticNamePrefix}filter`] =
      code`export const ${syntheticNamePrefix}filter = ${this.inlineFilterFunction};`;

    if (this.features.has("hash")) {
      staticModuleDeclarations[`${syntheticNamePrefix}hash`] =
        code`export function ${syntheticNamePrefix}hash<HasherT extends ${snippets.Hasher}>(value: ${this._name}, hasher: HasherT): HasherT { ${this.inlineHashStatements({ depth: 0, variables: { hasher: code`hasher`, value: code`value` } })} return hasher; }`;
    }

    if (this.features.has("json")) {
      staticModuleDeclarations[`${syntheticNamePrefix}Json`] =
        this.jsonTypeAliasDeclaration;

      staticModuleDeclarations[`${syntheticNamePrefix}fromJson`] =
        code`export const ${syntheticNamePrefix}fromJson = ${this.inlineFromJsonFunction};`;

      staticModuleDeclarations[`${syntheticNamePrefix}jsonZodSchema`] =
        this.jsonZodSchemaFunctionDeclaration;

      staticModuleDeclarations[`${syntheticNamePrefix}parseJson`] = code`\
export function ${syntheticNamePrefix}parseJson(json: unknown): ${imports.Either}<Error, ${this.name}> {
  const ${syntheticNamePrefix}jsonSafeParseResult = ${syntheticNamePrefix}jsonZodSchema().safeParse(json);
  if (!${syntheticNamePrefix}jsonSafeParseResult.success) { return ${imports.Left}(${syntheticNamePrefix}jsonSafeParseResult.error); }
  return ${imports.Right}(${syntheticNamePrefix}fromJson(${syntheticNamePrefix}jsonSafeParseResult.data));
}`;

      staticModuleDeclarations[`${syntheticNamePrefix}toJson`] =
        code`export const ${syntheticNamePrefix}toJson = ${this.inlineToJsonFunction};`;
    }

    if (this.features.has("rdf")) {
      staticModuleDeclarations[`${syntheticNamePrefix}fromRdfResourceValues`] =
        code`export const ${syntheticNamePrefix}fromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<${this.name}> = ${this.inlineFromRdfResourceValuesFunction};`;

      staticModuleDeclarations[`${syntheticNamePrefix}toRdfResourceValues`] =
        code`export const ${syntheticNamePrefix}toRdfResourceValues: ${snippets.ToRdfResourceValuesFunction}<${this.name}> = ${this.inlineToRdfResourceValuesFunction};`;
    }

    if (this.features.has("sparql")) {
      staticModuleDeclarations[
        `${syntheticNamePrefix}valueSparqlConstructTriples`
      ] =
        code`export const ${syntheticNamePrefix}valueSparqlConstructTriples: ${snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}> = ${this.inlineValueSparqlConstructTriplesFunction};`;

      staticModuleDeclarations[
        `${syntheticNamePrefix}valueSparqlWherePatterns`
      ] =
        code`export const ${syntheticNamePrefix}valueSparqlWherePatterns: ${snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}> = ${this.inlineValueSparqlWherePatternsFunction};`;
    }

    return staticModuleDeclarations;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): Code {
    if (this.features.has("json")) {
      return code`${this.staticModuleName}.${syntheticNamePrefix}fromJson(${variables.value})`;
    }
    return code`${this.inlineFromJsonFunction}(${variables.value})`;
  }

  override fromRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["fromRdfResourceValuesExpression"]>[0]): Code {
    const { resourceValues: resourceValuesVariable, ...otherVariables } =
      variables;
    if (this.features.has("rdf")) {
      return code`${this.staticModuleName}.${syntheticNamePrefix}fromRdfResourceValues(${resourceValuesVariable}, ${otherVariables})`;
    }
    return code`${this.inlineFromRdfResourceValuesFunction}(${resourceValuesVariable}, ${otherVariables})`;
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<AbstractType["hashStatements"]>[0]): readonly Code[] {
    if (this.features.has("hash")) {
      return [
        code`${this.staticModuleName}.${syntheticNamePrefix}hash(${variables.value}, ${variables.hasher});`,
      ];
    }
    return this.inlineHashStatements({ depth, variables });
  }

  @Memoize()
  override jsonType(): AbstractType.JsonType {
    if (this.features.has("json")) {
      return new AbstractType.JsonType(
        `${this.staticModuleName}.${syntheticNamePrefix}Json`,
      );
    }
    return this.inlineJsonType;
  }

  override jsonZodSchema({
    context,
  }: Parameters<AbstractType["jsonZodSchema"]>[0]): Code {
    if (this.features.has("json")) {
      const expression = code`${this.staticModuleName}.${syntheticNamePrefix}jsonZodSchema()`;
      if (context === "property" && this.recursive) {
        return code`${imports.z}.lazy((): ${imports.z}.ZodType<${this.staticModuleName}.${syntheticNamePrefix}Json> => ${expression})`;
      }
      return expression;
    }
    return this.inlineJsonZodSchema;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): Code {
    if (this.features.has("json")) {
      return code`${this.staticModuleName}.${syntheticNamePrefix}toJson(${variables.value})`;
    }
    return code`${this.inlineToJsonFunction}(${variables.value})`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["toRdfResourceValuesExpression"]>[0]): Code {
    const { value: valueVariable, ...otherVariables } = variables;
    if (this.features.has("rdf")) {
      return code`${this.staticModuleName}.${syntheticNamePrefix}toRdfResourceValues(${valueVariable}, ${otherVariables})`;
    }
    return code`${this.inlineToRdfResourceValuesFunction}(${valueVariable}, ${otherVariables})`;
  }
}
