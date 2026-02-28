import type * as rdfjs from "@rdfjs/types";

import { pascalCase } from "change-case";
import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { codeEquals } from "../codeEquals.js";
import { imports } from "../imports.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";
import { tsComment } from "../tsComment.js";
import { AbstractProperty } from "./AbstractProperty.js";

export class ShaclProperty<TypeT extends Type> extends AbstractProperty<TypeT> {
  private readonly comment: Maybe<string>;
  private readonly description: Maybe<string>;
  private readonly label: Maybe<string>;

  override readonly kind = "ShaclProperty";
  override readonly mutable: boolean;
  readonly path: rdfjs.NamedNode;
  override readonly recursive: boolean;

  constructor({
    comment,
    description,
    label,
    mutable,
    path,
    recursive,
    ...superParameters
  }: {
    comment: Maybe<string>;
    description: Maybe<string>;
    label: Maybe<string>;
    mutable: boolean;
    path: rdfjs.NamedNode;
    recursive: boolean;
  } & ConstructorParameters<typeof AbstractProperty<TypeT>>[0]) {
    super(superParameters);
    this.comment = comment;
    this.description = description;
    this.label = label;
    this.mutable = mutable;
    this.path = path;
    this.recursive = recursive;
  }

  @Memoize()
  override get constructorParametersSignature(): Maybe<Code> {
    let hasQuestionToken = false;
    const typeNames: Code[] = [];
    for (const conversion of this.type.conversions) {
      if (conversion.sourceTypeof === "undefined") {
        hasQuestionToken = true;
      } else if (
        !typeNames.some((typeName) =>
          codeEquals(typeName, conversion.sourceTypeName),
        )
      ) {
        typeNames.push(code`${conversion.sourceTypeName}`);
      }
    }

    return Maybe.of(
      code`readonly ${this.name}${hasQuestionToken ? "?" : ""}: ${joinCode(typeNames, { on: "|" })};`,
    );
  }

  @Memoize()
  override get declaration(): Maybe<Code> {
    const lhs: Code[] = [];
    if (
      this.objectType.declarationType === "class" &&
      this.visibility !== "public"
    ) {
      lhs.push(code`${this.visibility}`);
    }
    if (!this.mutable) {
      lhs.push(code`readonly`);
    }
    lhs.push(code`${this.name}`);
    return Maybe.of(
      code`${this.comment
        .alt(this.description)
        .alt(this.label)
        .map(tsComment)
        .orDefault("")}${joinCode(lhs, { on: " " })}: ${this.type.name};`,
    );
  }

  @Memoize()
  override get equalsFunction(): Maybe<Code> {
    return Maybe.of(this.type.equalsFunction);
  }

  @Memoize()
  override get filterProperty() {
    if (this.visibility !== "public") {
      return Maybe.empty();
    }

    return Maybe.of({
      name: this.name,
      type: this.type.filterType,
    });
  }

  override get getAccessorDeclaration(): Maybe<Code> {
    return Maybe.empty();
  }

  @Memoize()
  override get graphqlField(): AbstractProperty<TypeT>["graphqlField"] {
    const args = this.type.graphqlArgs;
    const argsVariable = args.isJust() ? code`args` : code`_args`;
    return Maybe.of({
      args,
      description: this.comment.map(JSON.stringify),
      name: this.name,
      resolve: code`(source, ${argsVariable}) => ${this.type.graphqlResolveExpression({ variables: { args: argsVariable, value: code`source.${this.name}` } })}`,
      type: this.type.graphqlType.name,
    });
  }

  @Memoize()
  override get jsonSignature(): Maybe<Code> {
    const typeJsonType = this.type.jsonType();
    return Maybe.of(
      code`readonly ${this.name}${typeJsonType.optional ? "?" : ""}: ${typeJsonType.requiredName}`,
    );
  }

  @Memoize()
  override get jsonZodSchema(): AbstractProperty<TypeT>["jsonZodSchema"] {
    let schema = this.type.jsonZodSchema({
      context: "property",
    });
    this.comment.alt(this.description).ifJust((description) => {
      schema = code`${schema}.describe(${literalOf(description)})`;
    });
    return Maybe.of({
      key: this.name,
      schema,
    });
  }

  @Memoize()
  protected get predicate(): Code {
    return code`${this.objectType.staticModuleName}.${syntheticNamePrefix}schema.properties.${this.name}.identifier`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      // comment: this.comment.map(JSON.stringify).extract(),
      // description: this.description.map(JSON.stringify).extract(),
      identifier: this.objectType.features.has("rdf")
        ? rdfjsTermExpression(this.path)
        : undefined,
      // label: this.label.map(JSON.stringify).extract(),
      // mutable: this.mutable ? true : undefined,
      // recursive: this.recursive ? true : undefined,
      // visibility:
      //   this.visibility !== "public"
      //     ? `${JSON.stringify(this.visibility)} as const`
      //     : undefined,
    };
  }

  override constructorStatements({
    variables,
  }: Parameters<
    AbstractProperty<TypeT>["constructorStatements"]
  >[0]): readonly Code[] {
    const typeConversions = this.type.conversions;
    if (typeConversions.length === 1) {
      switch (this.objectType.declarationType) {
        case "class":
          return [code`this.${this.name} = ${variables.parameter};`];
        case "interface":
          return [code`const ${this.name} = ${variables.parameter};`];
      }
    }

    let lhs: string;
    const statements: Code[] = [];
    switch (this.objectType.declarationType) {
      case "class":
        lhs = `this.${this.name}`;
        break;
      case "interface":
        lhs = `${this.name}`;
        statements.push(code`let ${this.name}: ${this.type.name};`);
        break;
    }

    statements.push(
      joinCode(
        typeConversions
          .map(
            (conversion) =>
              code`if (${conversion.sourceTypeCheckExpression(variables.parameter)}) { ${lhs} = ${conversion.conversionExpression(variables.parameter)}; }`,
          )
          // We shouldn't need this else, since the parameter now has the never type, but have to add it to appease the TypeScript compiler
          .concat(code`{ ${lhs} = (${variables.parameter}) satisfies never; }`),
        { on: " else " },
      ),
    );

    return statements;
  }

  override fromJsonStatements({
    variables,
  }: Parameters<
    AbstractProperty<TypeT>["fromJsonStatements"]
  >[0]): readonly Code[] {
    return [
      code`const ${this.name} = ${this.type.fromJsonExpression({ variables: { value: code`${variables.jsonObject}["${this.name}"]` } })};`,
    ];
  }

  override fromRdfExpression({
    variables,
  }: Parameters<AbstractProperty<TypeT>["fromRdfExpression"]>[0]): Maybe<Code> {
    // Assume the property has the correct range and ignore the object's RDF type.
    // This also accommodates the case where the object of a property is a dangling identifier that's not the
    // subject of any statements.

    return Maybe.of(
      code`${this.type.fromRdfExpression({
        variables: {
          ...variables,
          ignoreRdfType: true,
          predicate: this.predicate,
          resourceValues: code`${imports.Either}.of<Error, ${imports.Resource}.Values<${imports.Resource}.TermValue>>(${variables.resource}.values(${syntheticNamePrefix}schema.properties.${this.name}.identifier, { unique: true }))`,
        },
      })}.chain(values => values.head())`,
    );
  }

  override hashStatements(
    parameters: Parameters<AbstractProperty<TypeT>["hashStatements"]>[0],
  ): readonly Code[] {
    return this.type.hashStatements(parameters);
  }

  jsonUiSchemaElement({
    variables,
  }: Parameters<
    AbstractProperty<TypeT>["jsonUiSchemaElement"]
  >[0]): Maybe<Code> {
    const scope = code`\`\${${variables.scopePrefix}}/properties/${this.name}\``;
    return this.type
      .jsonUiSchemaElement({ variables: { scopePrefix: scope } })
      .altLazy(() =>
        Maybe.of(
          code`{ ${this.label.isJust() ? `label: "${this.label.unsafeCoerce()}", ` : ""}scope: ${scope}, type: "Control" }`,
        ),
      );
  }

  override sparqlConstructTriples({
    variables,
  }: Parameters<
    AbstractProperty<TypeT>["sparqlConstructTriples"]
  >[0]): Maybe<Code> {
    const valueString = code`\`\${${variables.variablePrefix}}${pascalCase(this.name)}\``;
    const valueVariable = code`${imports.dataFactory}.variable!(${valueString})`;
    return Maybe.of(
      code`[${{
        object: valueVariable,
        predicate: this.predicate,
        subject: variables.focusIdentifier,
      }}${this.type
        .sparqlConstructTriples({
          allowIgnoreRdfType: true,
          variables: {
            valueVariable,
            variablePrefix: valueString,
          },
        })
        .map((code_) => code`, ...${code_}`)
        .orDefault(code``)}]`,
    );
  }

  override sparqlWherePatterns({
    variables,
  }: Parameters<AbstractProperty<TypeT>["sparqlWherePatterns"]>[0]): ReturnType<
    AbstractProperty<TypeT>["sparqlWherePatterns"]
  > {
    const valueString = code`\`\${${variables.variablePrefix}}${pascalCase(this.name)}\``;
    const valueVariable = code`${imports.dataFactory}.variable!(${valueString})`;
    return Maybe.of({
      patterns: code`${this.type.sparqlWherePatternsFunction}(${{
        filter: this.filterProperty
          .map(({ name }) => code`${variables.filter}?.${name}`)
          .extract(),
        preferredLanguages: variables.preferredLanguages,
        propertyPatterns: [
          code`${{
            triples: [
              {
                object: valueVariable,
                predicate: this.predicate,
                subject: variables.focusIdentifier,
              },
            ],
            type: literalOf("bgp"),
          }} satisfies sparqljs.BgpPattern`,
        ],
        schema: code`${this.objectType.staticModuleName}.${syntheticNamePrefix}schema.properties.${this.name}.type()`,
        valueVariable,
        variablePrefix: valueString,
      }})`,
    });
  }

  override toJsonObjectMemberExpression(
    parameters: Parameters<
      AbstractProperty<TypeT>["toJsonObjectMemberExpression"]
    >[0],
  ): Maybe<Code> {
    return Maybe.of(
      code`${this.name}: ${this.type.toJsonExpression(parameters)}`,
    );
  }

  override toRdfStatements({
    variables,
  }: Parameters<
    AbstractProperty<TypeT>["toRdfStatements"]
  >[0]): readonly Code[] {
    return [
      code`${variables.resource}.add(${this.predicate}, ${this.type.toRdfExpression(
        {
          variables: { ...variables, predicate: this.predicate },
        },
      )}, ${variables.graph});`,
    ];
  }
}
