import { rdf } from "@tpluscode/rdf-ns-builders";

import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import {
  type GetAccessorDeclarationStructure,
  type OptionalKind,
  type PropertyDeclarationStructure,
  type PropertySignatureStructure,
  Scope,
} from "ts-morph";

import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { Memoize } from "typescript-memoize";
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

  private get abstract(): boolean {
    return this.objectType.abstract;
  }

  @Memoize()
  override get constructorParametersPropertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    if (this.abstract) {
      // If the property is not declared or it's declared abstract, we just pass up parameters to super as-is.
      const propertyDeclaration = this.propertyDeclaration.extractNullable();
      if (propertyDeclaration === null || propertyDeclaration.isAbstract) {
        return Maybe.empty();
      }
    }

    const typeNames = new Set<string>(); // Remove duplicates with a set
    for (const conversion of this.type.conversions) {
      if (conversion.sourceTypeName !== "undefined") {
        typeNames.add(conversion.sourceTypeName);
      }
    }

    return Maybe.of({
      hasQuestionToken:
        this.identifierMintingStrategy.isJust() ||
        this.objectType.ancestorObjectTypes.some((ancestorObjectType) =>
          ancestorObjectType.identifierProperty.identifierMintingStrategy.isJust(),
        ) ||
        this.objectType.descendantObjectTypes.some((descendantObjectType) =>
          descendantObjectType.identifierProperty.identifierMintingStrategy.isJust(),
        ),
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
    // If this, an ancestor, or a descendant has an identifier minting strategy then all classes in the hierarchy must
    // have get accessors.

    const checkIdentifierTermTypeStatements = (
      identifierVariable: string,
      identifierVariableNodeKinds?: ReadonlySet<IdentifierNodeKind>,
    ): readonly string[] => {
      if (this.type.nodeKinds.size === 2) {
        return [];
      }

      const expectedNodeKind: IdentifierNodeKind = this.type.nodeKinds.has(
        "BlankNode",
      )
        ? "BlankNode"
        : "NamedNode";

      if (identifierVariableNodeKinds) {
        if (
          identifierVariableNodeKinds.size === 1 &&
          identifierVariableNodeKinds.has(expectedNodeKind)
        ) {
          return [];
        }
      }

      return [
        `if (${identifierVariable}.termType !== "${expectedNodeKind}") { throw new Error(\`expected identifier to be ${expectedNodeKind}, not \${${identifierVariable}.termType}\`); }`,
      ];
    };

    if (this.identifierMintingStrategy.isJust()) {
      // Mint the identifier lazily in the get accessor
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
          `if (typeof this._${this.name} === "undefined") { ${memoizeMintedIdentifier ? `this._${this.name} = ${mintIdentifier};` : `return ${mintIdentifier};`} }`,
          ...checkIdentifierTermTypeStatements(`this._${this.name}`),
          `return this._${this.name};`,
        ],
      });
    }

    // If this object type has an ancestor or a descendant with an identifier minting strategy, declare a get accessor.
    if (
      this.objectType.ancestorObjectTypes.some((ancestorObjectType) =>
        ancestorObjectType.identifierProperty.identifierMintingStrategy.isJust(),
      ) ||
      this.objectType.descendantObjectTypes.some((descendantObjectType) =>
        descendantObjectType.identifierProperty.identifierMintingStrategy.isJust(),
      )
    ) {
      if (this.objectType.parentObjectTypes.length > 0) {
        // If this object type isn't the root, delegate up.
        const checkSuperIdentifierTermTypeStatements =
          checkIdentifierTermTypeStatements(
            "identifier",
            this.objectType.parentObjectTypes[0].identifierType.nodeKinds,
          );
        if (checkSuperIdentifierTermTypeStatements.length === 0) {
          return Maybe.empty(); // Don't need a get accessor just to return super.identifier.
        }

        return Maybe.of({
          hasOverrideKeyword: true,
          name: this.name,
          returnType: this.typeAlias,
          statements: [
            `const identifier = super.${this.name}`,
            ...checkSuperIdentifierTermTypeStatements,
            "return identifier;",
          ],
        });
      }

      // This object type is the root but it has no identifier minting strategy.
      // Just return the declared property in the get accessor.
      // Subclasses will override the get accessor.
      const propertyDeclaration = this.propertyDeclaration.unsafeCoerce();
      invariant(propertyDeclaration.hasQuestionToken);
      return Maybe.of({
        leadingTrivia: this.override ? "override " : undefined,
        name: this.name,
        returnType: this.typeAlias,
        statements: [
          `if (typeof this.${propertyDeclaration.name} === "undefined") { throw new Error("unable to mint identifier"); }`,
          `return this.${propertyDeclaration.name};`,
        ],
      });
    }

    // None of the object type hierarchy has an identifier minting strategy, don't need a get accessor
    return Maybe.empty();
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
    const constructorParametersPropertySignature =
      this.constructorParametersPropertySignature.extractNullable();
    if (constructorParametersPropertySignature === null) {
      return [];
    }

    let lhs: string;
    const statements: string[] = [];
    const typeConversions = this.type.conversions;
    switch (this.objectType.declarationType) {
      case "class": {
        const propertyDeclaration = this.propertyDeclaration.extractNullable();
        if (propertyDeclaration === null) {
          return [];
        }
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
          // The identifier will be minted lazily in the get accessor
          invariant(this.getAccessorDeclaration.isJust());
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
              mintIdentifier = `dataFactory.namedNode(\`\${${variables.parameters}.${this.identifierPrefixPropertyName} ?? "urn:shaclmate:${this.objectType.discriminantValue}:"}\${uuid.v4()}\`)`;
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
        `switch (${variables.resource}.identifier.value) { ${this.type.in_.map((iri) => `case "${iri.value}": ${this.name} = ${rdfjsTermExpression(iri)}; break;`).join(" ")} default: return purify.Left(new rdfjsResource.Resource.MistypedTermValueError({ actualValue: ${variables.resource}.identifier, expectedValueType: ${JSON.stringify(this.type.name)}, focusResource: ${variables.resource}, predicate: ${rdfjsTermExpression(rdf.subject)} })); }`,
      ];
    }

    const statements: string[] = [];
    if (this.type.isNamedNodeKind) {
      statements.push(
        `if (${variables.resource}.identifier.termType !== "NamedNode") { return purify.Left(new rdfjsResource.Resource.MistypedTermValueError({ actualValue: ${variables.resource}.identifier, expectedValueType: ${JSON.stringify(this.type.name)}, focusResource: ${variables.resource}, predicate: ${rdfjsTermExpression(rdf.subject)} })); }`,
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

  @Memoize()
  override get propertyDeclaration(): Maybe<
    OptionalKind<PropertyDeclarationStructure>
  > {
    if (this.objectType.parentObjectTypes.length > 0) {
      // An ancestor will declare the identifier property.
      return Maybe.empty();
    }

    if (
      this.identifierMintingStrategy.isJust() ||
      this.objectType.ancestorObjectTypes.some((ancestorObjectType) =>
        ancestorObjectType.identifierProperty.identifierMintingStrategy.isJust(),
      ) ||
      this.objectType.descendantObjectTypes.some((descendantObjectType) =>
        descendantObjectType.identifierProperty.identifierMintingStrategy.isJust(),
      )
    ) {
      // If this, an ancestor, or a descendant has an identifier minting strategy, declare the identifier property
      // private or protected and prefix its name with _ in order to avoid a conflict with the get accessor name.
      return Maybe.of({
        hasQuestionToken: true,
        name: `_${this.name}`,
        scope: this.objectType.descendantObjectTypes.some(
          (descendantObjectType) =>
            descendantObjectType.identifierProperty.identifierMintingStrategy.isJust(),
        )
          ? Scope.Protected
          : Scope.Private,
        type: this.typeAlias,
      });
    }

    if (this.abstract) {
      // Declare the property abstract and public
      return Maybe.of({
        isReadonly: true,
        // Work around a ts-morph bug that puts the override keyword before the abstract keyword
        leadingTrivia: this.override ? "abstract override " : "abstract ",
        name: this.name,
        type: this.typeAlias,
      });
    }

    // Declare the property public
    return Maybe.of({
      hasOverrideKeyword: this.override,
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
