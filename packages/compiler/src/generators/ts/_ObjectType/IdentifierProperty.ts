import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { rdf } from "@tpluscode/rdf-ns-builders";

import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { type Code, code, joinCode } from "ts-poet";
import { Memoize } from "typescript-memoize";

import type { IdentifierMintingStrategy } from "../../../enums/index.js";
import { logger } from "../../../logger.js";
import type { BlankNodeType } from "../BlankNodeType.js";
import { codeEquals } from "../codeEquals.js";
import type { IdentifierType } from "../IdentifierType.js";
import { imports } from "../imports.js";
import type { NamedNodeType } from "../NamedNodeType.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { AbstractProperty } from "./AbstractProperty.js";

export class IdentifierProperty extends AbstractProperty<
  BlankNodeType | IdentifierType | NamedNodeType
> {
  private readonly identifierMintingStrategy: Maybe<IdentifierMintingStrategy>;
  private readonly identifierPrefixPropertyName: string;
  private readonly typeAlias: Code;

  readonly kind = "IdentifierProperty";
  override readonly mutable = false;
  override readonly recursive = false;

  constructor({
    identifierMintingStrategy,
    identifierPrefixPropertyName,
    typeAlias,
    ...superParameters
  }: {
    identifierMintingStrategy: Maybe<IdentifierMintingStrategy>;
    identifierPrefixPropertyName: string;
    type: BlankNodeType | IdentifierType | NamedNodeType;
    typeAlias: Code;
  } & ConstructorParameters<typeof AbstractProperty>[0]) {
    super(superParameters);
    invariant(this.visibility === "public");
    this.identifierMintingStrategy = identifierMintingStrategy;
    this.identifierPrefixPropertyName = identifierPrefixPropertyName;
    this.typeAlias = typeAlias;
  }

  @Memoize()
  override get constructorParametersSignature(): Maybe<Code> {
    if (this.abstract) {
      // If the property is not declared or it's declared abstract, we just pass up parameters to super as-is.
      if (this.declaration.isNothing() || this.abstract) {
        return Maybe.empty();
      }
    }

    const hasQuestionToken =
      this.identifierMintingStrategy.isJust() ||
      this.objectType.ancestorObjectTypes.some((ancestorObjectType) =>
        ancestorObjectType.identifierProperty.identifierMintingStrategy.isJust(),
      ) ||
      this.objectType.descendantObjectTypes.some((descendantObjectType) =>
        descendantObjectType.identifierProperty.identifierMintingStrategy.isJust(),
      );

    const typeNames: Code[] = [];
    for (const conversion of this.type.conversions) {
      if (
        conversion.sourceTypeof !== "undefined" &&
        !typeNames.some((typeName) =>
          codeEquals(typeName, conversion.sourceTypeName),
        )
      ) {
        typeNames.push(code`${conversion.sourceTypeName}`);
      }
    }

    return Maybe.of(
      code`readonly ${this.name}${hasQuestionToken ? "?" : ""}: ${joinCode(typeNames, { on: "|" })}`,
    );
  }

  @Memoize()
  override get declaration(): Maybe<Code> {
    if (this.objectType.declarationType === "interface") {
      return Maybe.of(code`readonly ${this.name}: ${this.typeAlias};`);
    }

    if (this.objectType.parentObjectTypes.length > 0) {
      // An ancestor will declare the identifier property.
      return Maybe.empty();
    }

    const name = this.declarationName;

    if (
      this.identifierMintingStrategy.isJust() ||
      this.objectType.ancestorObjectTypes.some((ancestorObjectType) =>
        ancestorObjectType.identifierProperty.identifierMintingStrategy.isJust(),
      ) ||
      this.objectType.descendantObjectTypes.some((descendantObjectType) =>
        descendantObjectType.identifierProperty.identifierMintingStrategy.isJust(),
      )
    ) {
      return Maybe.of(
        code`${
          this.objectType.descendantObjectTypes.some((descendantObjectType) =>
            descendantObjectType.identifierProperty.identifierMintingStrategy.isJust(),
          )
            ? "protected "
            : "private "
        } ${name}?: ${this.typeAlias};`,
      );
    }

    if (this.abstract) {
      // Declare the property abstract and public
      return Maybe.of(
        code`abstract ${this.override ? "override " : ""}readonly ${name}: ${this.typeAlias};`,
      );
    }

    // Declare the property public
    return Maybe.of(
      code`${this.override ? "override " : ""}readonly ${name}: ${this.typeAlias};`,
    );
  }

  @Memoize()
  get equalsFunction(): Maybe<Code> {
    return Maybe.of(this.type.equalsFunction);
  }

  @Memoize()
  override get filterProperty() {
    return Maybe.of({
      name: this.name,
      type: this.type.filterType,
    });
  }

  @Memoize()
  override get getAccessorDeclaration(): Maybe<Code> {
    // If this, an ancestor, or a descendant has an identifier minting strategy then all classes in the hierarchy must
    // have get accessors.

    const checkIdentifierTermTypeStatements = (
      identifierVariable: string,
      identifierVariableNodeKinds?: ReadonlySet<IdentifierNodeKind>,
    ): readonly Code[] => {
      if (this.type.nodeKinds.size === 2) {
        return [];
      }

      const expectedNodeKind: IdentifierNodeKind =
        this.type.kind !== "NamedNodeType" ? "BlankNode" : "NamedNode";

      if (identifierVariableNodeKinds) {
        if (
          identifierVariableNodeKinds.size === 1 &&
          identifierVariableNodeKinds.has(expectedNodeKind)
        ) {
          return [];
        }
      }

      return [
        code`if (${identifierVariable}.termType !== "${expectedNodeKind}") { throw new Error(\`expected identifier to be ${expectedNodeKind}, not \${${identifierVariable}.termType}\`); }`,
      ];
    };

    if (this.identifierMintingStrategy.isJust()) {
      // Mint the identifier lazily in the get accessor
      let memoizeMintedIdentifier: boolean;
      let mintIdentifier: Code;
      switch (this.identifierMintingStrategy.unsafeCoerce()) {
        case "blankNode":
          memoizeMintedIdentifier = true;
          mintIdentifier = code`${imports.dataFactory}.blankNode()`;
          break;
        case "sha256":
          // If the object is mutable don't memoize the minted identifier, since the hash will change if the object mutates.
          memoizeMintedIdentifier = !this.objectType.mutable;
          mintIdentifier = code`${imports.dataFactory}.namedNode(\`\${this.${this.identifierPrefixPropertyName}}\${this.${syntheticNamePrefix}hashShaclProperties(${imports.sha256}.create())}\`)`;
          break;
        case "uuidv4":
          memoizeMintedIdentifier = true;
          mintIdentifier = code`${imports.dataFactory}.namedNode(\`\${this.${this.identifierPrefixPropertyName}}\${${imports.uuid}.v4()}\`)`;
          break;
      }

      return Maybe.of(code`\
      ${this.override ? "override " : ""} get ${this.name}(): ${this.typeAlias} { ${joinCode(
        [
          code`if (typeof this._${this.name} === "undefined") { ${memoizeMintedIdentifier ? `this._${this.name} = ${mintIdentifier};` : `return ${mintIdentifier};`} }`,
          ...checkIdentifierTermTypeStatements(`this._${this.name}`),
          code`return this._${this.name};`,
        ],
      )}`);
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

        return Maybe.of(
          code`override get ${this.name}(): ${this.typeAlias} { ${joinCode([
            code`const identifier = super.${this.name}`,
            ...checkSuperIdentifierTermTypeStatements,
            code`return identifier;`,
          ])} }`,
        );
      }

      // This object type is the root but it has no identifier minting strategy.
      // Just return the declared property in the get accessor.
      // Subclasses will override the get accessor.
      return Maybe.of(
        code`${this.override ? "override " : ""}get ${this.name}(): ${this.typeAlias} { ${joinCode(
          [
            code`if (typeof this.${this.declarationName} === "undefined") { throw new Error("unable to mint identifier"); }`,
            code`return this.${this.declarationName};`,
          ],
        )}`,
      );
    }

    // None of the object type hierarchy has an identifier minting strategy, don't need a get accessor
    return Maybe.empty();
  }

  @Memoize()
  override get graphqlField(): AbstractProperty<IdentifierType>["graphqlField"] {
    invariant(this.name.startsWith(syntheticNamePrefix));
    return Maybe.of({
      args: Maybe.empty(),
      description: Maybe.empty(),
      name: `_${this.name.substring(syntheticNamePrefix.length)}`,
      resolve: code`(source) => ${this.typeAlias}.toString(source.${this.name})`,
      type: this.type.graphqlType.name,
    });
  }

  @Memoize()
  override get jsonSignature(): Maybe<Code> {
    return Maybe.of(code`readonly "@id": string`);
  }

  @Memoize()
  override get jsonZodSchema(): AbstractProperty<IdentifierType>["jsonZodSchema"] {
    let schema: Code;
    if (this.type.in_.length > 0 && this.type.kind === "NamedNodeType") {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      schema = code`${imports.z}.enum(${JSON.stringify(this.type.in_.map((iri) => iri.value))})`;
    } else {
      schema = code`${imports.z}.string().min(1)`;
    }

    return Maybe.of({
      key: "@id",
      schema,
    });
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      identifierMintingStrategy: this.identifierMintingStrategy
        .map((_) => `${JSON.stringify(_)} as const`)
        .extract(),
    };
  }

  private get abstract(): boolean {
    return this.objectType.abstract;
  }

  private get declarationName(): string {
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
      return `_${this.name}`;
    }

    return this.name;
  }

  private get override(): boolean {
    return this.objectType.parentObjectTypes.length > 0;
  }

  override constructorStatements({
    variables,
  }: Parameters<
    AbstractProperty<IdentifierType>["constructorStatements"]
  >[0]): readonly Code[] {
    const constructorParametersSignature =
      this.constructorParametersSignature.extractNullable();
    if (constructorParametersSignature === null) {
      return [];
    }

    let lhs: string;
    const statements: Code[] = [];
    const typeConversions = this.type.conversions;
    switch (this.objectType.declarationType) {
      case "class": {
        if (this.declaration.isNothing()) {
          return [];
        }
        lhs = `this.${this.declarationName}`;
        break;
      }
      case "interface":
        lhs = this.name;
        statements.push(code`let ${this.name}: ${this.typeAlias};`);
        break;
    }

    const conversionBranches: Code[] = [];
    for (const conversion of typeConversions) {
      invariant(conversion.sourceTypeof !== "undefined");
      conversionBranches.push(
        code`if (${conversion.sourceTypeCheckExpression(variables.parameter)}) { ${lhs} = ${conversion.conversionExpression(variables.parameter)}; }`,
      );
    }
    this.identifierMintingStrategy.ifJust((identifierMintingStrategy) => {
      switch (this.objectType.declarationType) {
        case "class":
          // The identifier will be minted lazily in the get accessor
          invariant(this.getAccessorDeclaration.isJust());
          conversionBranches.push(
            code`if (typeof ${variables.parameter} === "undefined") { }`,
          );
          break;
        case "interface": {
          let mintIdentifier: string;
          switch (identifierMintingStrategy) {
            case "blankNode":
              mintIdentifier = "${imports.dataFactory}.blankNode()";
              break;
            case "sha256":
              logger.warn(
                "minting %s identifiers with %s is unsupported",
                this.objectType.declarationType,
                identifierMintingStrategy,
              );
              return;
            case "uuidv4":
              mintIdentifier = `${imports.dataFactory}.namedNode(\`\${${variables.parameters}.${this.identifierPrefixPropertyName} ?? "urn:shaclmate:${this.objectType.discriminantValue}:"}\${uuid.v4()}\`)`;
              break;
          }
          conversionBranches.push(
            code`if (typeof ${variables.parameter} === "undefined") { ${lhs} = ${mintIdentifier}; }`,
          );
        }
      }
    });

    // We shouldn't need this else, since the parameter now has the never type, but have to add it to appease the TypeScript compiler
    conversionBranches.push(
      code`{ ${lhs} = (${variables.parameter}) satisfies never;\n }`,
    );
    statements.push(joinCode(conversionBranches, { on: " else " }));

    return statements;
  }

  override fromJsonStatements({
    variables,
  }: Parameters<
    AbstractProperty<IdentifierType>["fromJsonStatements"]
  >[0]): readonly Code[] {
    return [
      code`const ${this.name} = ${this.type.fromJsonExpression({ variables: { value: variables.jsonObject } })};`,
    ];
  }

  override fromRdfExpression({
    variables,
  }: Parameters<
    AbstractProperty<IdentifierType>["fromRdfExpression"]
  >[0]): Maybe<Code> {
    if (this.type.in_.length > 0 && this.type.kind === "NamedNodeType") {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      return Maybe.of(
        code`(${this.type.in_.map((iri) => `${variables.resource}.identifier.value === "${iri.value}"`).join(" || ")}) ? ${imports.Either}.of<Error, ${this.typeAlias}>(${variables.resource}.identifier as ${this.typeAlias}) : ${imports.Left}(new ${imports.Resource}.MistypedTermValueError({ actualValue: ${variables.resource}.identifier, expectedValueType: ${JSON.stringify(this.type.name)}, focusResource: ${variables.resource}, predicate: ${rdfjsTermExpression(rdf.subject)} }))`,
      );
    }

    if (
      this.type.kind === "BlankNodeType" ||
      this.type.kind === "NamedNodeType"
    ) {
      return Maybe.of(
        code`${variables.resource}.identifier.termType === "${this.type.kind === "BlankNodeType" ? "BlankNode" : "NamedNode"}" ? ${imports.Either}.of<Error, ${this.typeAlias}>(${variables.resource}.identifier) : ${imports.Left}(new ${imports.Resource}.MistypedTermValueError({ actualValue: ${variables.resource}.identifier, expectedValueType: ${JSON.stringify(this.type.name)}, focusResource: ${variables.resource}, predicate: ${rdfjsTermExpression(rdf.subject)} }))`,
      );
    }

    return Maybe.of(
      code`${imports.Either}.of<Error, ${this.typeAlias}>(${variables.resource}.identifier as ${this.typeAlias})`,
    );
  }

  override hashStatements({
    variables,
  }: Parameters<
    AbstractProperty<IdentifierType>["hashStatements"]
  >[0]): readonly Code[] {
    return [code`${variables.hasher}.update(${variables.value}.value);`];
  }

  override jsonUiSchemaElement({
    variables,
  }: Parameters<
    AbstractProperty<IdentifierType>["jsonUiSchemaElement"]
  >[0]): Maybe<Code> {
    return Maybe.of(
      code`{ label: "Identifier", scope: \`\${${variables.scopePrefix}}/properties/@id\`, type: "Control" }`,
    );
  }

  override sparqlConstructTriples(): Maybe<Code> {
    return Maybe.empty();
  }

  override sparqlWherePatterns({
    variables,
  }: Parameters<AbstractProperty<IdentifierType>["sparqlWherePatterns"]>[0]) {
    return Maybe.of({
      condition: code`${variables.focusIdentifier}.termType === "Variable"`,
      patterns: code`${this.type.sparqlWherePatternsFunction}(${{
        filter: `${variables.filter}?.${this.name}`,
        preferredLanguages: variables.preferredLanguages,
        propertyPatterns: "[]",
        schema: `${this.objectType.staticModuleName}.${syntheticNamePrefix}schema.properties.${this.objectType.identifierProperty.name}.type()`,
        valueVariable: variables.focusIdentifier,
        variablePrefix: variables.variablePrefix, // Unused
      }})`,
    });
  }

  override toJsonObjectMemberExpression({
    variables,
  }: Parameters<
    AbstractProperty<IdentifierType>["toJsonObjectMemberExpression"]
  >[0]): Maybe<Code> {
    const nodeKinds = [...this.type.nodeKinds];
    const valueToNodeKinds = nodeKinds.map((nodeKind) => {
      switch (nodeKind) {
        case "BlankNode":
          return code`\`_:\${${variables.value}.value}\``;
        case "NamedNode":
          return code`${variables.value}.value`;
        default:
          throw new RangeError(nodeKind);
      }
    });
    if (valueToNodeKinds.length === 1) {
      return Maybe.of(code`"@id": ${valueToNodeKinds[0]}`);
    }
    invariant(valueToNodeKinds.length === 2);
    return Maybe.of(
      code`"@id": ${variables.value}.termType === "${nodeKinds[0]}" ? ${valueToNodeKinds[0]} : ${valueToNodeKinds[1]}`,
    );
  }

  override toRdfStatements(): readonly Code[] {
    return [];
  }
}
