import { pascalCase } from "change-case";
import { Maybe } from "purify-ts";
import type { OptionalKind, PropertySignatureStructure } from "ts-morph";

import type { Type } from "../Type.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { ShaclProperty } from "./ShaclProperty.js";

export class EagerShaclProperty<
  TypeT extends Type,
> extends ShaclProperty<TypeT> {
  override readonly mutable: boolean;
  override readonly recursive: boolean;

  constructor({
    mutable,
    recursive,
    ...superParameters
  }: {
    mutable: boolean;
    recursive: boolean;
  } & ConstructorParameters<typeof ShaclProperty<TypeT>>[0]) {
    super(superParameters);
    this.mutable = mutable;
    this.recursive = recursive;
  }

  override get equalsFunction(): string {
    return this.type.equalsFunction;
  }

  override get graphqlField(): ShaclProperty<TypeT>["graphqlField"] {
    return Maybe.of({
      description: this.comment.map(JSON.stringify).extract(),
      name: this.name,
      resolve: `(source) => ${this.type.graphqlResolveExpression({ variables: { value: `source.${this.name}` } })}`,
      type: this.type.graphqlName,
    });
  }

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

  override constructorStatements({
    variables,
  }: Parameters<
    ShaclProperty<TypeT>["constructorStatements"]
  >[0]): readonly string[] {
    let lhs: string;
    switch (this.objectType.declarationType) {
      case "class":
        lhs = `this.${this.name}`;
        break;
      case "interface":
        lhs = this.name;
        break;
    }

    const typeConversions = this.type.conversions;
    if (typeConversions.length === 1) {
      return [`${lhs} = ${variables.parameter};`];
    }
    const statements: string[] = [];
    if (this.objectType.declarationType === "interface") {
      statements.push(`let ${this.name}: ${this.type.name};`);
    }
    const conversionBranches: string[] = [];
    for (const conversion of this.type.conversions) {
      conversionBranches.push(
        `if (${conversion.sourceTypeCheckExpression(variables.parameter)}) { ${lhs} = ${conversion.conversionExpression(variables.parameter)}; }`,
      );
    }
    // We shouldn't need this else, since the parameter now has the never type, but have to add it to appease the TypeScript compiler
    conversionBranches.push(
      `{ ${lhs} = (${variables.parameter}) satisfies never; }`,
    );
    statements.push(conversionBranches.join(" else "));
    return statements;
  }

  override fromJsonStatements({
    variables,
  }: Parameters<
    ShaclProperty<TypeT>["fromJsonStatements"]
  >[0]): readonly string[] {
    return [
      `const ${this.name} = ${this.type.fromJsonExpression({ variables: { value: `${variables.jsonObject}["${this.name}"]` } })};`,
    ];
  }

  override fromRdfStatements({
    variables,
  }: Parameters<
    ShaclProperty<TypeT>["fromRdfStatements"]
  >[0]): readonly string[] {
    // Assume the property has the correct range and ignore the object's RDF type.
    // This also accommodates the case where the object of a property is a dangling identifier that's not the
    // subject of any statements.
    return [
      `const _${this.name}Either: purify.Either<Error, ${this.type.name}> = ${this.type.fromRdfExpression({ variables: { ...variables, ignoreRdfType: true, predicate: this.predicate, resourceValues: `${variables.resource}.values(${syntheticNamePrefix}properties.${this.name}["identifier"], { unique: true })` } })};`,
      `if (_${this.name}Either.isLeft()) { return _${this.name}Either; }`,
      `const ${this.name} = _${this.name}Either.unsafeCoerce();`,
    ];
  }

  override hashStatements(
    parameters: Parameters<ShaclProperty<TypeT>["hashStatements"]>[0],
  ): readonly string[] {
    return this.type.hashStatements(parameters);
  }

  jsonUiSchemaElement({
    variables,
  }: Parameters<
    ShaclProperty<TypeT>["jsonUiSchemaElement"]
  >[0]): Maybe<string> {
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
    parameters: Parameters<ShaclProperty<TypeT>["jsonZodSchema"]>[0],
  ): ReturnType<ShaclProperty<TypeT>["jsonZodSchema"]> {
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

  sparqlConstructTemplateTriples({
    variables,
  }: Parameters<
    ShaclProperty<TypeT>["sparqlConstructTemplateTriples"]
  >[0]): readonly string[] {
    const objectString = `\`\${${variables.variablePrefix}}${pascalCase(this.name)}\``;
    return this.type.sparqlConstructTemplateTriples({
      allowIgnoreRdfType: true,
      context: "object",
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
  }: Parameters<
    ShaclProperty<TypeT>["sparqlWherePatterns"]
  >[0]): readonly string[] {
    const objectString = `\`\${${variables.variablePrefix}}${pascalCase(this.name)}\``;
    return this.type.sparqlWherePatterns({
      allowIgnoreRdfType: true,
      context: "object",
      variables: {
        object: `${this.dataFactoryVariable}.variable!(${objectString})`,
        predicate: this.predicate,
        subject: variables.subject,
        variablePrefix: objectString,
      },
    });
  }

  override toJsonObjectMember(
    parameters: Parameters<ShaclProperty<TypeT>["toJsonObjectMember"]>[0],
  ): Maybe<string> {
    return Maybe.of(`${this.name}: ${this.type.toJsonExpression(parameters)}`);
  }

  override toRdfStatements({
    variables,
  }: Parameters<
    ShaclProperty<TypeT>["toRdfStatements"]
  >[0]): readonly string[] {
    return [
      `${variables.resource}.add(${this.predicate}, ${this.type.toRdfExpression(
        {
          variables: { ...variables, predicate: this.predicate },
        },
      )});`,
    ];
  }
}
