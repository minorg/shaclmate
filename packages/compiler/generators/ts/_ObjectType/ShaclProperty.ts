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
import { tsComment } from "../tsComment.js";
import { Property } from "./Property.js";

export class ShaclProperty extends Property<Type> {
  private readonly comment: Maybe<string>;
  private readonly description: Maybe<string>;
  private readonly label: Maybe<string>;
  override readonly mutable: boolean;
  private readonly path: rdfjs.NamedNode;

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

  override get classConstructorParametersPropertySignature(): Maybe<
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

  override get declarationImports(): readonly Import[] {
    return this.type.useImports;
  }

  override get equalsFunction(): string {
    return this.type.equalsFunction;
  }

  override get interfacePropertySignature(): OptionalKind<PropertySignatureStructure> {
    return {
      isReadonly: !this.mutable,
      leadingTrivia: this.declarationComment,
      name: this.name,
      type: this.type.name,
    };
  }

  override get jsonPropertySignature(): OptionalKind<PropertySignatureStructure> {
    return {
      isReadonly: true,
      name: this.name,
      type: this.type.jsonName,
    };
  }

  @Memoize()
  private get pathExpression(): string {
    return `${this.dataFactoryVariable}.namedNode("${this.path.value}")`;
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
      let sourceTypeCheckExpression = conversion.sourceTypeCheckExpression
        ? conversion.sourceTypeCheckExpression(variables.parameter)
        : undefined;
      if (!sourceTypeCheckExpression) {
        switch (conversion.sourceTypeName) {
          case "boolean":
          case "number":
          case "string":
          case "undefined": {
            sourceTypeCheckExpression = `typeof ${variables.parameter} === "${conversion.sourceTypeName}"`;
            break;
          }
          default: {
            sourceTypeCheckExpression = `typeof ${variables.parameter} === "object"`;
            break;
          }
        }
      }

      statements.push(
        `if (${sourceTypeCheckExpression}) { this.${this.name} = ${conversion.conversionExpression(variables.parameter)}; }`,
      );
    }
    // We shouldn't need this else, since the parameter now has the never type, but have to add it to appease the TypeScript compiler
    statements.push(
      `{ this.${this.name} = ${variables.parameter}; // never\n }`,
    );
    return [statements.join(" else ")];
  }

  override fromRdfStatements({
    variables,
  }: Parameters<Property<Type>["fromRdfStatements"]>[0]): readonly string[] {
    return [
      `const _${this.name}Either: purify.Either<rdfjsResource.Resource.ValueError, ${this.type.name}> = ${this.type.propertyFromRdfExpression({ variables: { ...variables, predicate: this.pathExpression, resourceValues: `${variables.resource}.values(${this.pathExpression}, { unique: true })` } })};`,
      `if (_${this.name}Either.isLeft()) { return _${this.name}Either; }`,
      `const ${this.name} = _${this.name}Either.unsafeCoerce();`,
    ];
  }

  override hashStatements(
    parameters: Parameters<Property<Type>["hashStatements"]>[0],
  ): readonly string[] {
    return this.type.propertyHashStatements(parameters);
  }

  override sparqlGraphPatternExpression(): Maybe<string> {
    return Maybe.of(
      this.type
        .propertySparqlGraphPatternExpression({
          variables: {
            object: `this.variable("${pascalCase(this.name)}")`,
            predicate: this.pathExpression,
            subject: "this.subject",
          },
        })
        .toSparqlGraphPatternExpression()
        .toString(),
    );
  }

  override toJsonObjectMember(
    parameters: Parameters<Property<Type>["toJsonObjectMember"]>[0],
  ): string {
    return `${this.name}: ${this.type.propertyToJsonExpression(parameters)}`;
  }

  override toRdfStatements({
    variables,
  }: Parameters<Property<Type>["toRdfStatements"]>[0]): readonly string[] {
    return [
      `${variables.resource}.add(${this.pathExpression}, ${this.type.propertyToRdfExpression(
        {
          variables: { ...variables, predicate: this.pathExpression },
        },
      )});`,
    ];
  }

  private get declarationComment(): string | undefined {
    return this.comment
      .alt(this.description)
      .alt(this.label)
      .map(tsComment)
      .extract();
  }
}
