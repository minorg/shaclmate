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

import type { IdentifierType } from "../IdentifierType.js";
import type { Import } from "../Import.js";
import type { Type } from "../Type.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { tsComment } from "../tsComment.js";
import { Property } from "./Property.js";

export class ShaclProperty extends Property<Type> {
  private readonly comment: Maybe<string>;
  private readonly description: Maybe<string>;
  private readonly label: Maybe<string>;

  override readonly mutable: boolean;
  readonly path: rdfjs.NamedNode;

  constructor({
    comment,
    description,
    label,
    mutable,
    path,
    ...superParameters
  }: {
    comment: Maybe<string>;
    description: Maybe<string>;
    label: Maybe<string>;
    mutable: boolean;
    path: rdfjs.NamedNode;
    type: Type;
  } & ConstructorParameters<typeof Property>[0]) {
    super(superParameters);
    this.comment = comment;
    this.description = description;
    this.label = label;
    this.mutable = mutable;
    this.path = path;
  }

  override get classGetAccessorDeclaration(): Maybe<
    OptionalKind<GetAccessorDeclarationStructure>
  > {
    return Maybe.empty();
  }

  override get classPropertyDeclaration(): Maybe<
    OptionalKind<PropertyDeclarationStructure>
  > {
    return Maybe.of({
      isReadonly: !this.mutable,
      leadingTrivia: this.declarationComment,
      name: this.name,
      scope: Property.visibilityToScope(this.visibility),
      type: this.type.name,
    });
  }

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

  override get declarationImports(): readonly Import[] {
    return this.type.useImports(this.objectType.features);
  }

  override get equalsFunction(): string {
    return this.type.equalsFunction;
  }

  override get graphqlField(): Property<Type>["graphqlField"] {
    return Maybe.of({
      description: this.comment.map(JSON.stringify).extract(),
      name: this.name,
      resolve: `(source) => ${this.type.graphqlResolveExpression({ variables: { value: `source.${this.name}` } })}`,
      type: this.type.graphqlName,
    });
  }

  override get interfacePropertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    return Maybe.of({
      isReadonly: !this.mutable,
      leadingTrivia: this.declarationComment,
      name: this.name,
      type: this.type.name,
    });
  }

  override get jsonPropertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    return Maybe.of({
      isReadonly: true,
      name: this.name,
      type: this.type.jsonName,
    });
  }

  override get snippetDeclarations(): readonly string[] {
    return this.type.snippetDeclarations(this.objectType.features);
  }

  private get declarationComment(): string | undefined {
    return this.comment
      .alt(this.description)
      .alt(this.label)
      .map(tsComment)
      .extract();
  }

  @Memoize()
  private get predicate(): string {
    return `${this.objectType.staticModuleName}.${syntheticNamePrefix}properties.${this.name}["identifier"]`;
  }

  override classConstructorStatements({
    variables,
  }: Parameters<
    Property<Type>["classConstructorStatements"]
  >[0]): readonly string[] {
    const typeConversions = this.type.conversions;
    if (typeConversions.length === 1) {
      return [`this.${this.name} = ${variables.parameter};`];
    }
    const statements: string[] = [];
    for (const conversion of this.type.conversions) {
      statements.push(
        `if (${conversion.sourceTypeCheckExpression(variables.parameter)}) { this.${this.name} = ${conversion.conversionExpression(variables.parameter)}; }`,
      );
    }
    // We shouldn't need this else, since the parameter now has the never type, but have to add it to appease the TypeScript compiler
    statements.push(
      `{ this.${this.name} =( ${variables.parameter}) satisfies never;\n }`,
    );
    return [statements.join(" else ")];
  }

  override fromJsonStatements({
    variables,
  }: Parameters<
    Property<IdentifierType>["fromJsonStatements"]
  >[0]): readonly string[] {
    return [
      `const ${this.name} = ${this.type.fromJsonExpression({ variables: { value: `${variables.jsonObject}["${this.name}"]` } })};`,
    ];
  }

  override fromRdfStatements({
    variables,
  }: Parameters<Property<Type>["fromRdfStatements"]>[0]): readonly string[] {
    // Assume the property has the correct range and ignore the object's RDF type.
    // This also accommodates the case where the object of a property is a dangling identifier that's not the
    // subject of any statements.
    return [
      `const _${this.name}Either: purify.Either<rdfjsResource.Resource.ValueError, ${this.type.name}> = ${this.type.fromRdfExpression({ variables: { ...variables, ignoreRdfType: true, predicate: this.predicate, resourceValues: `${variables.resource}.values(${syntheticNamePrefix}properties.${this.name}["identifier"], { unique: true })` } })};`,
      `if (_${this.name}Either.isLeft()) { return _${this.name}Either; }`,
      `const ${this.name} = _${this.name}Either.unsafeCoerce();`,
    ];
  }

  override hashStatements(
    parameters: Parameters<Property<Type>["hashStatements"]>[0],
  ): readonly string[] {
    return this.type.hashStatements(parameters);
  }

  override interfaceConstructorStatements({
    variables,
  }: Parameters<
    Property<Type>["interfaceConstructorStatements"]
  >[0]): readonly string[] {
    const typeConversions = this.type.conversions;
    if (typeConversions.length === 1) {
      return [`const ${this.name} = ${variables.parameter};`];
    }
    const statements: string[] = [`let ${this.name}: ${this.type.name};`];
    const conversionBranches: string[] = [];
    for (const conversion of this.type.conversions) {
      conversionBranches.push(
        `if (${conversion.sourceTypeCheckExpression(variables.parameter)}) { ${this.name} = ${conversion.conversionExpression(variables.parameter)}; }`,
      );
    }
    // We shouldn't need this else, since the parameter now has the never type, but have to add it to appease the TypeScript compiler
    conversionBranches.push(
      `{ ${this.name} =( ${variables.parameter}) satisfies never;\n }`,
    );
    statements.push(conversionBranches.join(" else "));
    return statements;
  }

  jsonUiSchemaElement({
    variables,
  }: Parameters<Property<Type>["jsonUiSchemaElement"]>[0]): Maybe<string> {
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
    parameters: Parameters<Property<Type>["jsonZodSchema"]>[0],
  ): ReturnType<Property<Type>["jsonZodSchema"]> {
    let schema = this.type.jsonZodSchema(parameters);
    this.comment.alt(this.description).ifJust((description) => {
      schema = `${schema}.describe(${JSON.stringify(description)})`;
    });
    return Maybe.of({
      key: this.name,
      schema,
    });
  }

  sparqlConstructTemplateTriples({
    variables,
  }: Parameters<
    Property<Type>["sparqlConstructTemplateTriples"]
  >[0]): readonly string[] {
    const objectString = `\`\${${variables.variablePrefix}}${pascalCase(this.name)}\``;
    return this.type.sparqlConstructTemplateTriples({
      context: "property",
      variables: {
        object: `${this.dataFactoryVariable}.variable!(${objectString})`,
        predicate: this.predicate,
        subject: variables.subject,
        variablePrefix: objectString,
      },
    });
  }

  sparqlWherePatterns({
    variables,
  }: Parameters<Property<Type>["sparqlWherePatterns"]>[0]): readonly string[] {
    const objectString = `\`\${${variables.variablePrefix}}${pascalCase(this.name)}\``;
    return this.type.sparqlWherePatterns({
      context: "property",
      variables: {
        object: `${this.dataFactoryVariable}.variable!(${objectString})`,
        predicate: this.predicate,
        subject: variables.subject,
        variablePrefix: objectString,
      },
    });
  }

  override toJsonObjectMember(
    parameters: Parameters<Property<Type>["toJsonObjectMember"]>[0],
  ): Maybe<string> {
    return Maybe.of(`${this.name}: ${this.type.toJsonExpression(parameters)}`);
  }

  override toRdfStatements({
    variables,
  }: Parameters<Property<Type>["toRdfStatements"]>[0]): readonly string[] {
    return [
      `${variables.resource}.add(${this.predicate}, ${this.type.toRdfExpression(
        {
          variables: { ...variables, predicate: this.predicate },
        },
      )});`,
    ];
  }
}
