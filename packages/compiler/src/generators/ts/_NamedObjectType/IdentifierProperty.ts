import { type IdentifierNodeKind, NodeKind } from "@shaclmate/shacl-ast";
import { rdf } from "@tpluscode/rdf-ns-builders";

import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import type { BlankNodeType } from "../BlankNodeType.js";
import { codeEquals } from "../codeEquals.js";
import type { IdentifierType } from "../IdentifierType.js";
import type { IriType } from "../IriType.js";
import { imports } from "../imports.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { arrayOf, type Code, code, joinCode } from "../ts-poet-wrapper.js";
import { AbstractProperty } from "./AbstractProperty.js";

export class IdentifierProperty extends AbstractProperty<
  BlankNodeType | IdentifierType | IriType
> {
  private readonly typeAlias: Code;

  override readonly kind = "IdentifierProperty";
  override readonly mutable = false;
  override readonly recursive = false;

  constructor({
    typeAlias,
    ...superParameters
  }: {
    type: BlankNodeType | IdentifierType | IriType;
    typeAlias: Code;
  } & ConstructorParameters<typeof AbstractProperty>[0]) {
    super(superParameters);
    this.typeAlias = typeAlias;
  }

  @Memoize()
  override get constructorParametersSignature(): Maybe<Code> {
    const hasQuestionToken = (
      this.type.nodeKinds as ReadonlySet<IdentifierNodeKind>
    ).has("BlankNode");

    const typeNames: Code[] = [code`(() => ${this.typeAlias})`];
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
      code`readonly ${this.name}${hasQuestionToken ? "?" : ""}: ${joinCode(typeNames, { on: "|" })};`,
    );
  }

  @Memoize()
  override get declaration(): Code {
    return code`readonly ${this.name}: () => ${this.typeAlias};`;
  }

  @Memoize()
  override get filterProperty() {
    return Maybe.of({
      name: this.name,
      type: this.type.filterType,
    });
  }

  @Memoize()
  override get graphqlField(): AbstractProperty<IdentifierType>["graphqlField"] {
    invariant(this.name.startsWith(syntheticNamePrefix));
    return Maybe.of({
      args: Maybe.empty(),
      description: Maybe.empty(),
      name: `_${this.name.substring(syntheticNamePrefix.length)}`,
      resolve: code`(source) => ${this.typeAlias}.stringify(${this.accessExpression({ variables: { object: code`source` } })})`,
      type: this.type.graphqlType.name,
    });
  }

  @Memoize()
  override get jsonSchema(): AbstractProperty<IdentifierType>["jsonSchema"] {
    let schema: Code;
    if (this.type.in_.length > 0 && this.type.kind === "IriType") {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      schema = code`${imports.z}.enum(${arrayOf(...this.type.in_.map((iri) => iri.value))})`;
    } else {
      schema = code`${imports.z}.string().min(1)`;
    }

    return Maybe.of({
      key: "@id",
      schema,
    });
  }

  @Memoize()
  override get jsonSignature(): Maybe<Code> {
    if (this.type.in_.length > 0) {
      return Maybe.of(
        code`readonly "@id": ${this.type.in_.map((iri) => `"${iri.value}"`).join(" | ")}`,
      );
    }

    return Maybe.of(code`readonly "@id": string`);
  }

  override accessExpression({
    variables,
  }: Parameters<
    AbstractProperty<
      BlankNodeType | IdentifierType | IriType
    >["accessExpression"]
  >[0]): Code {
    return code`${variables.object}.${this.name}()`;
  }

  override constructorStatements({
    variables,
  }: Parameters<
    AbstractProperty<IdentifierType>["constructorStatements"]
  >[0]): readonly Code[] {
    const parameterVariable = code`${this.name}Parameter`;
    const statements: Code[] = [
      // Pull out the parameter so the function can capture it if necessary.
      code`const ${parameterVariable} = ${variables.parameter};`,
      code`let ${this.name}: () => ${this.typeAlias};`,
    ];
    const typeConversions = this.type.conversions;
    const conversionBranches: Code[] = [
      code`if (typeof ${parameterVariable} === "function") { ${this.name} = ${parameterVariable}; }`,
    ];
    for (const conversion of typeConversions) {
      invariant(conversion.sourceTypeof !== "function");
      invariant(conversion.sourceTypeof !== "undefined");
      conversionBranches.push(
        code`if (${conversion.sourceTypeCheckExpression(parameterVariable)}) { ${this.name} = () => ${conversion.conversionExpression(parameterVariable)}; }`,
      );
    }
    if (
      (this.type.nodeKinds as ReadonlySet<IdentifierNodeKind>).has("BlankNode")
    ) {
      conversionBranches.push(
        code`if (${parameterVariable} === undefined) { const ${syntheticNamePrefix}eagerIdentifier = ${imports.dataFactory}.blankNode(); ${this.name} = () => ${syntheticNamePrefix}eagerIdentifier; }`,
      );
    }

    // We shouldn't need this else, since the parameter now has the never type, but have to add it to appease the TypeScript compiler
    conversionBranches.push(
      code`{ ${this.name} = (${parameterVariable}) satisfies never;\n }`,
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

  override fromRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractProperty<IdentifierType>["fromRdfResourceValuesExpression"]
  >[0]): Maybe<Code> {
    return Maybe.of(
      code`${this.type.fromRdfResourceValuesExpression({
        variables: {
          ...variables,
          propertyPath: rdfjsTermExpression(rdf.subject, {
            logger: this.logger,
          }),
          resourceValues: code`${imports.Right}(new ${imports.Resource}.Value(${{ dataFactory: imports.dataFactory, focusResource: variables.resource, propertyPath: rdfjsTermExpression(rdf.subject, { logger: this.logger }), term: code`${variables.resource}.identifier` }}).toValues())`,
        },
      })}.chain(values => values.head())`,
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

  override sparqlConstructTriplesExpression(): Maybe<Code> {
    return Maybe.empty();
  }

  override sparqlWherePatternsExpression({
    variables,
  }: Parameters<
    AbstractProperty<IdentifierType>["sparqlWherePatternsExpression"]
  >[0]) {
    return Maybe.of({
      condition: code`${variables.focusIdentifier}.termType === "Variable"`,
      patterns: code`${this.type.valueSparqlWherePatternsFunction}(${{
        filter: code`${variables.filter}?.${this.name}`,
        ignoreRdfType: true, // Unused
        preferredLanguages: variables.preferredLanguages,
        propertyPatterns: code`[]`,
        schema: code`${this.namedObjectType.staticModuleName}.${syntheticNamePrefix}schema.properties.${this.name}.type()`,
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
        case "IRI":
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
      code`"@id": ${variables.value}.termType === "${NodeKind.toTermType(nodeKinds[0])}" ? ${valueToNodeKinds[0]} : ${valueToNodeKinds[1]}`,
    );
  }

  override toRdfRdfResourceValuesStatements(): readonly Code[] {
    return [];
  }

  override toStringExpression(
    parameters: Parameters<
      AbstractProperty<IdentifierType>["toStringExpression"]
    >[0],
  ): Maybe<Code> {
    return Maybe.of(this.type.toStringExpression(parameters));
  }
}
