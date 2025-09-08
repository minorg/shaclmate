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
import type { Type } from "../Type.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { tsComment } from "../tsComment.js";
import { Property } from "./Property.js";

export abstract class ShaclProperty<
  TypeT extends Type,
> extends Property<TypeT> {
  protected readonly comment: Maybe<string>;
  protected readonly description: Maybe<string>;
  protected readonly label: Maybe<string>;

  readonly path: rdfjs.NamedNode;

  constructor({
    comment,
    description,
    label,
    path,
    ...superParameters
  }: {
    comment: Maybe<string>;
    description: Maybe<string>;
    label: Maybe<string>;
    path: rdfjs.NamedNode;
  } & ConstructorParameters<typeof Property<TypeT>>[0]) {
    super(superParameters);
    this.comment = comment;
    this.description = description;
    this.label = label;
    this.path = path;
  }

  override get equalsFunction(): string {
    return this.type.equalsFunction;
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

  override fromJsonStatements({
    variables,
  }: Parameters<Property<TypeT>["fromJsonStatements"]>[0]): readonly string[] {
    return [
      `const ${this.name} = ${this.type.fromJsonExpression({ variables: { value: `${variables.jsonObject}["${this.name}"]` } })};`,
    ];
  }

  override get getAccessorDeclaration(): Maybe<
    OptionalKind<GetAccessorDeclarationStructure>
  > {
    return Maybe.empty();
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
    return Maybe.of({
      hasQuestionToken: this.type.jsonPropertySignature.hasQuestionToken,
      isReadonly: true,
      name: this.name,
      type: this.type.jsonPropertySignature.name,
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
  ): readonly string[] {
    return this.type.snippetDeclarations(parameters);
  }

  override fromRdfStatements({
    variables,
  }: Parameters<Property<TypeT>["fromRdfStatements"]>[0]): readonly string[] {
    // Assume the property has the correct range and ignore the object's RDF type.
    // This also accommodates the case where the object of a property is a dangling identifier that's not the
    // subject of any statements.
    return [
      `const _${this.name}Either: purify.Either<Error, ${this.type.name}> = ${this.type.fromRdfExpression({ variables: { ...variables, ignoreRdfType: true, predicate: this.predicate, resourceValues: `${variables.resource}.values(${syntheticNamePrefix}properties.${this.name}["identifier"], { unique: true })` } })};`,
      `if (_${this.name}Either.isLeft()) { return _${this.name}Either; }`,
      `const ${this.name} = _${this.name}Either.unsafeCoerce();`,
    ];
  }

  sparqlConstructTemplateTriples({
    variables,
  }: Parameters<
    Property<TypeT>["sparqlConstructTemplateTriples"]
  >[0]): readonly string[] {
    const objectString = `\`\${${variables.variablePrefix}}${pascalCase(this.name)}\``;
    return this.type.sparqlConstructTemplateTriples({
      allowIgnoreRdfType: true,
      context: "object",
      variables: {
        object: `dataFactory.variable!(${objectString})`,
        predicate: this.predicate,
        subject: variables.subject,
        variablePrefix: objectString,
      },
    });
  }

  sparqlWherePatterns({
    variables,
  }: Parameters<Property<TypeT>["sparqlWherePatterns"]>[0]): readonly string[] {
    const objectString = `\`\${${variables.variablePrefix}}${pascalCase(this.name)}\``;
    return this.type.sparqlWherePatterns({
      allowIgnoreRdfType: true,
      context: "object",
      variables: {
        object: `dataFactory.variable!(${objectString})`,
        predicate: this.predicate,
        subject: variables.subject,
        variablePrefix: objectString,
      },
    });
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
      `${variables.resource}.add(${this.predicate}, ${this.type.toRdfExpression(
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
