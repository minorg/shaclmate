import { rdf } from "@tpluscode/rdf-ns-builders";

import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type {
  GetAccessorDeclarationStructure,
  OptionalKind,
  PropertyDeclarationStructure,
  PropertySignatureStructure,
} from "ts-morph";

import type { IdentifierMintingStrategy } from "../../../enums/index.js";
import { logger } from "../../../logger.js";
import type { IdentifierType } from "../IdentifierType.js";
import { Import } from "../Import.js";
import { SnippetDeclarations } from "../SnippetDeclarations.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { Property } from "./Property.js";

export class IdentifierProperty extends Property<IdentifierType> {
  private readonly identifierMintingStrategy: Maybe<IdentifierMintingStrategy>;
  private readonly identifierPrefixPropertyName: string;
  private readonly typeAlias: string;

  readonly equalsFunction = Maybe.of(`${syntheticNamePrefix}booleanEquals`);
  readonly mutable = false;
  readonly recursive = false;

  constructor({
    identifierMintingStrategy,
    identifierPrefixPropertyName,
    typeAlias,
    ...superParameters
  }: {
    identifierMintingStrategy: Maybe<IdentifierMintingStrategy>;
    identifierPrefixPropertyName: string;
    type: IdentifierType;
    typeAlias: string;
  } & ConstructorParameters<typeof Property>[0]) {
    super(superParameters);
    invariant(this.visibility === "public");
    this.identifierMintingStrategy = identifierMintingStrategy;
    this.identifierPrefixPropertyName = identifierPrefixPropertyName;
    this.typeAlias = typeAlias;
  }

  get abstract(): boolean {
    return this.objectType.abstract;
  }

  override get constructorParametersPropertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    if (this.objectType.declarationType === "class" && this.abstract) {
      return Maybe.empty();
    }

    const typeNames = new Set<string>(); // Remove duplicates with a set
    for (const conversion of this.type.conversions) {
      if (conversion.sourceTypeName !== "undefined") {
        typeNames.add(conversion.sourceTypeName);
      }
    }

    let hasQuestionToken: boolean;
    switch (this.objectType.declarationType) {
      case "class":
        hasQuestionToken = this.identifierMintingStrategy.isJust();
        break;
      case "interface": {
        const identifierMintingStrategy =
          this.identifierMintingStrategy.extract();
        hasQuestionToken =
          typeof identifierMintingStrategy !== "undefined" &&
          identifierMintingStrategy !== "sha256";
        break;
      }
    }

    return Maybe.of({
      hasQuestionToken,
      isReadonly: true,
      name: this.name,
      type: [...typeNames].sort().join(" | "),
    });
  }

  override get declarationImports(): readonly Import[] {
    const imports = this.type.useImports().concat();

    this.identifierMintingStrategy.ifJust((identifierMintingStrategy) => {
      switch (identifierMintingStrategy) {
        case "sha256":
          imports.push(Import.SHA256);
          break;
        case "uuidv4":
          imports.push(Import.UUID);
          break;
      }
    });

    return imports;
  }

  override get getAccessorDeclaration(): Maybe<
    OptionalKind<GetAccessorDeclarationStructure>
  > {
    if (this.abstract) {
      return Maybe.empty();
    }

    if (this.identifierMintingStrategy.isJust()) {
      let memoizeMintedIdentifier: boolean;
      let mintIdentifier: string;
      switch (this.identifierMintingStrategy.unsafeCoerce()) {
        case "blankNode":
          memoizeMintedIdentifier = true;
          mintIdentifier = "dataFactory.blankNode()";
          break;
        case "sha256":
          // If the object is mutable don't memoize the minted identifier, since the hash will change if the object mutates.
          memoizeMintedIdentifier = !this.objectType.mutable;
          mintIdentifier = `dataFactory.namedNode(\`\${this.${this.identifierPrefixPropertyName}}\${this.${syntheticNamePrefix}hashShaclProperties(sha256.create())}\`)`;
          break;
        case "uuidv4":
          memoizeMintedIdentifier = true;
          mintIdentifier = `dataFactory.namedNode(\`\${this.${this.identifierPrefixPropertyName}}\${uuid.v4()}\`)`;
          break;
      }

      return Maybe.of({
        leadingTrivia: this.override ? "override " : undefined,
        name: this.name,
        returnType: this.typeAlias,
        statements: [
          memoizeMintedIdentifier
            ? `if (typeof this._${this.name} === "undefined") { this._${this.name} = ${mintIdentifier}; } return this._${this.name};`
            : `return (typeof this._${this.name} !== "undefined") ? this._${this.name} : ${mintIdentifier}`,
        ],
      } satisfies OptionalKind<GetAccessorDeclarationStructure>);
    }

    return Maybe.of({
      leadingTrivia: this.override ? "override " : undefined,
      name: this.name,
      returnType: this.typeAlias,
      statements: this.propertyDeclaration
        .map((propertyDeclaration) => [
          `return this.${propertyDeclaration.name};`,
        ])
        .orDefault([`return super.${this.name} as ${this.typeAlias}`]),
    } satisfies OptionalKind<GetAccessorDeclarationStructure>);
  }

  override get graphqlField(): Property<IdentifierType>["graphqlField"] {
    invariant(this.name.startsWith(syntheticNamePrefix));
    return Maybe.of({
      args: Maybe.empty(),
      description: Maybe.empty(),
      name: `_${this.name.substring(syntheticNamePrefix.length)}`,
      resolve: `(source) => ${this.typeAlias}.toString(source.${this.name})`,
      type: this.type.graphqlName.toString(),
    });
  }

  override get jsonPropertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    return Maybe.of({
      isReadonly: true,
      name: "@id",
      type: "string",
    });
  }

  private get override(): boolean {
    return this.objectType.parentObjectTypes.length > 0;
  }

  override constructorStatements({
    variables,
  }: Parameters<
    Property<IdentifierType>["constructorStatements"]
  >[0]): readonly string[] {
    let lhs: string;
    const statements: string[] = [];
    const typeConversions = this.type.conversions;
    switch (this.objectType.declarationType) {
      case "class": {
        if (this.abstract) {
          return [];
        }
        if (this.propertyDeclaration.isNothing()) {
          return [];
        }
        const propertyDeclaration = this.propertyDeclaration.unsafeCoerce();
        if (typeConversions.length === 1) {
          return [`this.${propertyDeclaration.name} = ${variables.parameter};`];
        }
        lhs = `this.${propertyDeclaration.name}`;
        break;
      }
      case "interface":
        if (typeConversions.length === 1) {
          return [`const ${this.name} = ${variables.parameter};`];
        }
        lhs = this.name;
        statements.push(`let ${this.name}: ${this.typeAlias};`);
        break;
    }

    const conversionBranches: string[] = [];
    for (const conversion of typeConversions) {
      invariant(conversion.sourceTypeName !== "undefined");
      conversionBranches.push(
        `if (${conversion.sourceTypeCheckExpression(variables.parameter)}) { ${lhs} = ${conversion.conversionExpression(variables.parameter)}; }`,
      );
    }
    this.identifierMintingStrategy.ifJust((identifierMintingStrategy) => {
      switch (this.objectType.declarationType) {
        case "class":
          conversionBranches.push(
            `if (typeof ${variables.parameter} === "undefined") { }`,
          );
          break;
        case "interface": {
          let mintIdentifier: string;
          switch (identifierMintingStrategy) {
            case "blankNode":
              mintIdentifier = "dataFactory.blankNode()";
              break;
            case "sha256":
              logger.warn(
                "minting %s identifiers with %s is unsupported",
                this.objectType.declarationType,
                identifierMintingStrategy,
              );
              return;
            case "uuidv4":
              mintIdentifier = `dataFactory.namedNode(\`\${${variables.parameters}.${this.identifierPrefixPropertyName} ?? "urn:shaclmate:${this.objectType.discriminatorValue}:"}\${uuid.v4()}\`)`;
              break;
          }
          conversionBranches.push(
            `if (typeof ${variables.parameter} === "undefined") { ${lhs} = ${mintIdentifier}; }`,
          );
        }
      }
    });

    // We shouldn't need this else, since the parameter now has the never type, but have to add it to appease the TypeScript compiler
    conversionBranches.push(
      `{ ${lhs} = (${variables.parameter}) satisfies never;\n }`,
    );
    statements.push(conversionBranches.join(" else "));

    return statements;
  }

  override fromJsonStatements({
    variables,
  }: Parameters<
    Property<IdentifierType>["fromJsonStatements"]
  >[0]): readonly string[] {
    return [
      `const ${this.name} = ${this.type.fromJsonExpression({ variables: { value: variables.jsonObject } })};`,
    ];
  }

  override fromRdfStatements({
    variables,
  }: Parameters<
    Property<IdentifierType>["fromRdfStatements"]
  >[0]): readonly string[] {
    if (this.type.in_.length > 0 && this.type.isNamedNodeKind) {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      return [
        `let ${this.name}: ${this.typeAlias};`,
        `switch (${variables.resource}.identifier.value) { ${this.type.in_.map((iri) => `case "${iri.value}": ${this.name} = ${rdfjsTermExpression(iri)}; break;`).join(" ")} default: return purify.Left(new rdfjsResource.Resource.MistypedValueError({ actualValue: ${variables.resource}.identifier, expectedValueType: ${JSON.stringify(this.type.name)}, focusResource: ${variables.resource}, predicate: ${rdfjsTermExpression(rdf.subject)} })); }`,
      ];
    }

    const statements: string[] = [];
    if (this.type.isNamedNodeKind) {
      statements.push(
        `if (${variables.resource}.identifier.termType !== "NamedNode") { return purify.Left(new rdfjsResource.Resource.MistypedValueError({ actualValue: ${variables.resource}.identifier, expectedValueType: ${JSON.stringify(this.type.name)}, focusResource: ${variables.resource}, predicate: ${rdfjsTermExpression(rdf.subject)} })); }`,
      );
    }
    statements.push(
      `const ${this.name}: ${this.typeAlias} = ${variables.resource}.identifier;`,
    );
    return statements;
  }

  override hashStatements({
    variables,
  }: Parameters<
    Property<IdentifierType>["hashStatements"]
  >[0]): readonly string[] {
    return [`${variables.hasher}.update(${variables.value}.value);`];
  }

  override jsonUiSchemaElement({
    variables,
  }: Parameters<
    Property<IdentifierType>["jsonUiSchemaElement"]
  >[0]): Maybe<string> {
    return Maybe.of(
      `{ label: "Identifier", scope: \`\${${variables.scopePrefix}}/properties/${this.jsonPropertySignature.unsafeCoerce().name}\`, type: "Control" }`,
    );
  }

  override jsonZodSchema({
    variables,
  }: Parameters<Property<IdentifierType>["jsonZodSchema"]>[0]): ReturnType<
    Property<IdentifierType>["jsonZodSchema"]
  > {
    let schema: string;
    if (this.type.in_.length > 0 && this.type.isNamedNodeKind) {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      schema = `${variables.zod}.enum(${JSON.stringify(this.type.in_.map((iri) => iri.value))})`;
    } else {
      schema = `${variables.zod}.string().min(1)`;
    }

    return Maybe.of({
      key: this.jsonPropertySignature.unsafeCoerce().name,
      schema,
    });
  }

  override get propertyDeclaration(): Maybe<
    OptionalKind<PropertyDeclarationStructure>
  > {
    // See note in TypeFactory re: the logic of whether to declare the identifier in the class or not.
    if (this.propertyDeclarationVisibility.isNothing()) {
      return Maybe.empty();
    }

    if (this.abstract) {
      // Abstract version of the accessor
      // Work around a ts-morph bug that puts the override keyword before the abstract keyword
      return Maybe.of({
        hasOverrideKeyword:
          this.abstract && this.override ? undefined : this.override,
        isAbstract: this.abstract && this.override ? undefined : this.abstract,
        isReadonly: true,
        leadingTrivia:
          this.abstract && this.override ? "abstract override " : undefined,
        name: this.name,
        type: this.typeAlias,
      });
    }

    if (this.identifierMintingStrategy.isJust()) {
      // Mutable _identifier property that will be lazily initialized by the getter to mint the identifier
      return Maybe.of({
        hasQuestionToken: true,
        name: `_${this.name}`,
        scope: this.propertyDeclarationVisibility
          .map(Property.visibilityToScope)
          .unsafeCoerce(),
        type: `${this.typeAlias}`,
      });
    }

    // Immutable, public identifier property, no getter
    return Maybe.of({
      isReadonly: true,
      name: this.name,
      type: this.typeAlias,
    });
  }

  override get propertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    return Maybe.of({
      isReadonly: true,
      name: this.name,
      type: this.typeAlias,
    });
  }

  override snippetDeclarations(): readonly string[] {
    const snippetDeclarations: string[] = [];
    if (this.objectType.features.has("equals")) {
      snippetDeclarations.push(SnippetDeclarations.booleanEquals);
    }
    return snippetDeclarations;
  }

  override sparqlConstructTemplateTriples(): readonly string[] {
    return [];
  }

  override sparqlWherePatterns(): readonly string[] {
    return [];
  }

  override toJsonObjectMember({
    variables,
  }: Parameters<
    Property<IdentifierType>["toJsonObjectMember"]
  >[0]): Maybe<string> {
    const nodeKinds = [...this.type.nodeKinds];
    const valueToNodeKinds = nodeKinds.map((nodeKind) => {
      switch (nodeKind) {
        case "BlankNode":
          return `\`_:\${${variables.value}.value}\``;
        case "NamedNode":
          return `${variables.value}.value`;
        default:
          throw new RangeError(nodeKind);
      }
    });
    if (valueToNodeKinds.length === 1) {
      return Maybe.of(`"@id": ${valueToNodeKinds[0]}`);
    }
    invariant(valueToNodeKinds.length === 2);
    return Maybe.of(
      `"@id": ${variables.value}.termType === "${nodeKinds[0]}" ? ${valueToNodeKinds[0]} : ${valueToNodeKinds[1]}`,
    );
  }

  override toRdfStatements(): readonly string[] {
    return [];
  }
}
