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

    const staticModuleDeclarations = this.staticModuleDeclarations;
    if (staticModuleDeclarations.length > 0) {
      declarations.push(code`\
export namespace ${def(this.staticModuleName)} {
${joinCode(staticModuleDeclarations.concat(), { on: "\n\n" })}
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

  @Memoize()
  override get name(): string {
    return this._name;
  }

  @Memoize()
  override get sparqlConstructTriplesFunction(): Code {
    if (this.features.has("sparql")) {
      return code`${this.staticModuleName}.${syntheticNamePrefix}sparqlConstructTriples`;
    }
    return this.inlineSparqlConstructTriplesFunction;
  }

  @Memoize()
  override get sparqlWherePatternsFunction(): Code {
    if (this.features.has("sparql")) {
      return code`${this.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns`;
    }
    return this.inlineSparqlWherePatternsFunction;
  }

  get staticModuleName(): string {
    return this._name;
  }

  get jsonTypeAliasDeclaration(): Code {
    return code`export type ${syntheticNamePrefix}Json = ${this.inlineJsonType.name}`;
  }

  get jsonZodSchemaFunctionDeclaration(): Code {
    return code`export const ${syntheticNamePrefix}jsonZodSchema = () => ${this.inlineJsonZodSchema}`;
  }

  protected get staticModuleDeclarations(): readonly Code[] {
    const staticModuleDeclarations: Code[] = [];

    if (this.features.has("equals")) {
      staticModuleDeclarations.push(
        code`export const ${syntheticNamePrefix}equals = ${this.inlineEqualsFunction}`,
      );
    }
    staticModuleDeclarations.push(
      code`export type ${syntheticNamePrefix}Filter = ${this.inlineFilterType};`,
      code`export const ${syntheticNamePrefix}filter = ${this.inlineFilterFunction};`,
    );
    if (this.features.has("hash")) {
      staticModuleDeclarations.push(
        code`export function ${syntheticNamePrefix}hash<HasherT extends ${snippets.Hasher}>(value: ${this._name}, hasher: HasherT): HasherT { ${this.inlineHashStatements({ depth: 0, variables: { hasher: code`hasher`, value: code`value` } })} return hasher; }`,
      );
    }
    if (this.features.has("json")) {
      staticModuleDeclarations.push(
        this.jsonTypeAliasDeclaration,
        code`export const ${syntheticNamePrefix}fromJson = ${this.inlineFromJsonFunction}`,
        this.jsonZodSchemaFunctionDeclaration,
        code`export const ${syntheticNamePrefix}toJson = ${this.inlineToJsonFunction}`,
      );
    }
    if (this.features.has("rdf")) {
      staticModuleDeclarations.push(
        code`export const ${syntheticNamePrefix}fromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<${this.name}> = ${this.inlineFromRdfResourceValuesFunction}`,
        code`export const ${syntheticNamePrefix}toRdfResourceValues: ${snippets.ToRdfResourceValuesFunction}<${this.name}> = ${this.inlineToRdfResourceValuesFunction}`,
      );
    }
    if (this.features.has("sparql")) {
      staticModuleDeclarations.push(
        code`export const ${syntheticNamePrefix}sparqlConstructTriples: ${snippets.SparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}> = ${this.inlineSparqlConstructTriplesFunction};`,
        code`export const ${syntheticNamePrefix}sparqlWherePatterns: ${snippets.SparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}> = ${this.inlineSparqlWherePatternsFunction};`,
      );
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
