import type * as rdfjs from "@rdfjs/types";
import { pascalCase } from "change-case";
import { Maybe } from "purify-ts";
import type {
  GetAccessorDeclarationStructure,
  OptionalKind,
  PropertyDeclarationStructure,
  PropertySignatureStructure,
} from "ts-morph";
import { Memoize } from "typescript-memoize";
import type { Import } from "../Import.js";
import { objectInitializer } from "../objectInitializer.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import type { Type } from "../Type.js";
import { tsComment } from "../tsComment.js";
import { Property } from "./Property.js";

export class ShaclProperty<TypeT extends Type> extends Property<TypeT> {
  private readonly comment: Maybe<string>;
  private readonly description: Maybe<string>;
  private readonly label: Maybe<string>;

  readonly mutable: boolean;
  readonly path: rdfjs.NamedNode;
  readonly recursive: boolean;

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
  } & ConstructorParameters<typeof Property<TypeT>>[0]) {
    super(superParameters);
    this.comment = comment;
    this.description = description;
    this.label = label;
    this.mutable = mutable;
    this.path = path;
    this.recursive = recursive;
  }

  @Memoize()
  override get equalsFunction(): Maybe<string> {
    return Maybe.of(this.type.equalsFunction);
  }

  @Memoize()
  override get constructorParametersPropertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    let hasQuestionToken = false;
    const typeNames = new Set<string>(); // Remove duplicates with a set
    for (const conversion of this.type.conversions) {
      if (conversion.sourceTypeName === "undefined") {
        hasQuestionToken = true;
      } else {
        typeNames.add(conversion.sourceTypeName);
      }
    }

    return Maybe.of({
      hasQuestionToken,
      isReadonly: true,
      leadingTrivia: this.declarationComment,
      name: this.name,
      type: [...typeNames].sort().join(" | "),
    });
  }

  override constructorStatements({
    variables,
  }: Parameters<
    Property<TypeT>["constructorStatements"]
  >[0]): readonly string[] {
    const typeConversions = this.type.conversions;
    if (typeConversions.length === 1) {
      switch (this.objectType.declarationType) {
        case "class":
          return [`this.${this.name} = ${variables.parameter};`];
        case "interface":
          return [`const ${this.name} = ${variables.parameter};`];
      }
    }

    let lhs: string;
    const statements: string[] = [];
    switch (this.objectType.declarationType) {
      case "class":
        lhs = `this.${this.name}`;
        break;
      case "interface":
        lhs = this.name;
        statements.push(`let ${this.name}: ${this.type.name};`);
        break;
    }

    statements.push(
      typeConversions
        .map(
          (conversion) =>
            `if (${conversion.sourceTypeCheckExpression(variables.parameter)}) { ${lhs} = ${conversion.conversionExpression(variables.parameter)}; }`,
        )
        // We shouldn't need this else, since the parameter now has the never type, but have to add it to appease the TypeScript compiler
        .concat(`{ ${lhs} = (${variables.parameter}) satisfies never; }`)
        .join(" else "),
    );

    return statements;
  }

  override fromJsonStatements({
    variables,
  }: Parameters<Property<TypeT>["fromJsonStatements"]>[0]): readonly string[] {
    return [
      `const ${this.name} = ${this.type.fromJsonExpression({ variables: { value: `${variables.jsonObject}["${this.name}"]` } })};`,
    ];
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

  override get getAccessorDeclaration(): Maybe<
    OptionalKind<GetAccessorDeclarationStructure>
  > {
    return Maybe.empty();
  }

  @Memoize()
  override get graphqlField(): Property<TypeT>["graphqlField"] {
    const args = this.type.graphqlArgs;
    const argsVariable = args.isJust() ? "args" : "_args";
    return Maybe.of({
      args,
      description: this.comment.map(JSON.stringify),
      name: this.name,
      resolve: `(source, ${argsVariable}) => ${this.type.graphqlResolveExpression({ variables: { args: argsVariable, value: `source.${this.name}` } })}`,
      type: this.type.graphqlType.name,
    });
  }

  override hashStatements(
    parameters: Parameters<Property<TypeT>["hashStatements"]>[0],
  ): readonly string[] {
    return this.type.hashStatements(parameters);
  }

  @Memoize()
  override get jsonPropertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    const typeJsonType = this.type.jsonType();
    return Maybe.of({
      hasQuestionToken: typeJsonType.optional,
      isReadonly: true,
      name: this.name,
      type: typeJsonType.requiredName,
    });
  }

  jsonUiSchemaElement({
    variables,
  }: Parameters<Property<TypeT>["jsonUiSchemaElement"]>[0]): Maybe<string> {
    const scope = `\`\${${variables.scopePrefix}}/properties/${this.name}\``;
    return this.type
      .jsonUiSchemaElement({ variables: { scopePrefix: scope } })
      .altLazy(() =>
        Maybe.of(
          `{ ${this.label.isJust() ? `label: "${this.label.unsafeCoerce()}", ` : ""}scope: ${scope}, type: "Control" }`,
        ),
      );
  }

  override jsonZodSchema(
    parameters: Parameters<Property<TypeT>["jsonZodSchema"]>[0],
  ): ReturnType<Property<TypeT>["jsonZodSchema"]> {
    let schema = this.type.jsonZodSchema({
      ...parameters,
      context: "property",
    });
    this.comment.alt(this.description).ifJust((description) => {
      schema = `${schema}.describe(${JSON.stringify(description)})`;
    });
    return Maybe.of({
      key: this.name,
      schema,
    });
  }

  @Memoize()
  override get propertyDeclaration(): Maybe<
    OptionalKind<PropertyDeclarationStructure>
  > {
    return Maybe.of({
      isReadonly: !this.mutable,
      leadingTrivia: this.declarationComment,
      name: this.name,
      scope: ShaclProperty.visibilityToScope(this.visibility),
      type: this.type.name,
    });
  }

  @Memoize()
  override get declarationImports(): readonly Import[] {
    return this.type.useImports({ features: this.objectType.features });
  }

  @Memoize()
  override get propertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    return Maybe.of({
      isReadonly: !this.mutable,
      leadingTrivia: this.declarationComment,
      name: this.name,
      type: this.type.name,
    });
  }

  override snippetDeclarations(
    parameters: Parameters<Property<Type>["snippetDeclarations"]>[0],
  ): Readonly<Record<string, string>> {
    return this.type.snippetDeclarations(parameters);
  }

  override fromRdfStatements({
    variables,
  }: Parameters<Property<TypeT>["fromRdfStatements"]>[0]): readonly string[] {
    // Assume the property has the correct range and ignore the object's RDF type.
    // This also accommodates the case where the object of a property is a dangling identifier that's not the
    // subject of any statements.

    const typeFromRdfExpression = this.type.fromRdfExpression({
      variables: {
        ...variables,
        ignoreRdfType: true,
        predicate: this.predicate,
        resourceValues: `purify.Either.of<Error, rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>>(${variables.resource}.values(${syntheticNamePrefix}properties.${this.name}["identifier"], { unique: true }))`,
      },
    });

    return [
      `const _${this.name}Either: purify.Either<Error, ${this.type.name}> = ${typeFromRdfExpression}.chain(values => values.head());`,
      `if (_${this.name}Either.isLeft()) { return _${this.name}Either; }`,
      `const ${this.name} = _${this.name}Either.unsafeCoerce();`,
    ];
  }

  sparqlConstructTriples({
    variables,
  }: Parameters<
    Property<TypeT>["sparqlConstructTriples"]
  >[0]): readonly string[] {
    const valueString = `\`\${${variables.variablePrefix}}${pascalCase(this.name)}\``;
    const valueVariable = `dataFactory.variable!(${valueString})`;
    return [
      objectInitializer({
        object: valueVariable,
        predicate: this.predicate,
        subject: variables.focusIdentifier,
      }),
    ].concat(
      this.type.sparqlConstructTriples({
        allowIgnoreRdfType: true,
        variables: {
          valueVariable,
          variablePrefix: valueString,
        },
      }),
    );
  }

  sparqlWherePatterns({
    variables,
  }: Parameters<Property<TypeT>["sparqlWherePatterns"]>[0]) {
    const valueString = `\`\${${variables.variablePrefix}}${pascalCase(this.name)}\``;
    const valueVariable = `dataFactory.variable!(${valueString})`;
    return {
      patterns: this.type.sparqlWherePatterns({
        allowIgnoreRdfType: true,
        propertyPatterns: [
          {
            triples: [
              {
                object: valueVariable,
                predicate: this.predicate,
                subject: variables.focusIdentifier,
              },
            ],
            type: "bgp",
          },
        ],
        variables: {
          filter: this.filterProperty.map(
            ({ name }) => `${variables.filter}?.${name}`,
          ),
          preferredLanguages: variables.preferredLanguages,
          valueVariable,
          variablePrefix: valueString,
        },
      }),
    };
  }

  override toJsonObjectMember(
    parameters: Parameters<Property<TypeT>["toJsonObjectMember"]>[0],
  ): Maybe<string> {
    return Maybe.of(`${this.name}: ${this.type.toJsonExpression(parameters)}`);
  }

  override toRdfStatements({
    variables,
  }: Parameters<Property<TypeT>["toRdfStatements"]>[0]): readonly string[] {
    return [
      `${variables.resource}.add(${this.predicate}, ...${this.type.toRdfExpression(
        {
          variables: { ...variables, predicate: this.predicate },
        },
      )});`,
    ];
  }

  protected get declarationComment(): string | undefined {
    return this.comment
      .alt(this.description)
      .alt(this.label)
      .map(tsComment)
      .extract();
  }

  @Memoize()
  protected get predicate(): string {
    return `${this.objectType.staticModuleName}.${syntheticNamePrefix}properties.${this.name}["identifier"]`;
  }
}
