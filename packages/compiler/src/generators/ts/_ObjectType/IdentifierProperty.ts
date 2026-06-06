import { type IdentifierNodeKind, NodeKind } from "@shaclmate/shacl-ast";
import { rdf } from "@tpluscode/rdf-ns-builders";

import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import type { BlankNodeType } from "../BlankNodeType.js";
import type { IdentifierType } from "../IdentifierType.js";
import type { IriType } from "../IriType.js";
import {
  arrayOf,
  type Code,
  code,
  joinCode,
  literalOf,
} from "../ts-poet-wrapper.js";
import { AbstractProperty } from "./AbstractProperty.js";

export class IdentifierProperty extends AbstractProperty<
  BlankNodeType | IdentifierType | IriType
> {
  override readonly kind = "Identifier";
  override readonly mutable = false;
  override readonly recursive = false;

  @Memoize()
  override get constructorParameter(): Maybe<Code> {
    let hasQuestionToken: boolean = false;
    const typeExpressions: Code[] = [code`(() => ${this.typeExpression})`];
    for (const type of this.type.conversionFunction.unsafeCoerce()
      .sourceTypes) {
      if (type.jsType.typeof === "undefined") {
        hasQuestionToken = true;
      } else {
        typeExpressions.push(code`${type.expression}`);
      }
    }

    return Maybe.of(
      code`readonly ${this.name}${hasQuestionToken ? "?" : ""}: ${joinCode(typeExpressions, { on: "|" })};`,
    );
  }

  @Memoize()
  override get declaration(): Code {
    return code`readonly ${this.name}: () => ${this.typeExpression};`;
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
    const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
    invariant(this.name.startsWith(syntheticNamePrefix));
    return Maybe.of({
      args: Maybe.empty(),
      description: Maybe.empty(),
      name: `_${this.name.substring(syntheticNamePrefix.length)}`,
      resolve: code`(source) => ${this.typeExpression}.stringify(${this.accessExpression({ variables: { object: code`source` } })})`,
      type: this.type.graphqlType.expression,
    });
  }

  @Memoize()
  override get hashFunctionParameter(): Code {
    return code`readonly ${this.name}?: ${this.typeExpression}`;
  }

  @Memoize()
  override get jsonSchema(): AbstractProperty<IdentifierType>["jsonSchema"] {
    let schema: Code;
    if (this.type.in_.length > 0 && this.type.kind === "Iri") {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      schema = code`${this.reusables.imports.z}.enum(${arrayOf(...this.type.in_.map((iri) => iri.value))})`;
    } else {
      schema = code`${this.reusables.imports.z}.string().min(1)`;
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

  protected override get schemaInitializers(): readonly Code[] {
    return super.schemaInitializers.concat(code`type: ${this.type.schema}`);
  }

  @Memoize()
  private get typeExpression(): Code {
    return this.objectType.name
      .map((objectTypeAlias) => code`${objectTypeAlias}.Identifier`)
      .orDefault(this.type.expression);
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

  override constructorInitializer({
    variables,
  }: Parameters<
    AbstractProperty<IdentifierType>["constructorInitializer"]
  >[0]): Maybe<Code> {
    const nodeKinds = this.type.nodeKinds as ReadonlySet<IdentifierNodeKind>;

    let conversionFunction: Code;
    if (nodeKinds.size === 2) {
      conversionFunction = code`${this.reusables.snippets.convertToIdentifierProperty}`;
    } else {
      invariant(nodeKinds.size === 1);
      if (nodeKinds.has("BlankNode")) {
        conversionFunction = code`${this.reusables.snippets.convertToBlankNodeIdentifierProperty}`;
      } else {
        conversionFunction = code`${this.reusables.snippets.convertToIriIdentifierProperty}<${
          this.type.in_.length > 0
            ? joinCode(
                this.type.in_.map((in_) => code`${literalOf(in_.value)}`),
                { on: " | " },
              )
            : "string"
        }>`;
      }
    }

    return Maybe.of(
      code`${this.name}: ${conversionFunction}(${variables.parameters}.${this.name})`,
    );
  }

  override fromJsonInitializer({
    variables,
  }: Parameters<
    AbstractProperty<IdentifierType>["fromJsonInitializer"]
  >[0]): Maybe<Code> {
    return Maybe.of(
      code`${this.name}: ${this.type.fromJsonExpression({
        variables: { value: variables.jsonObject },
      })}`,
    );
  }

  override fromRdfResourceValuesInitializer({
    variables,
  }: Parameters<
    AbstractProperty<IdentifierType>["fromRdfResourceValuesInitializer"]
  >[0]): Maybe<Code> {
    const options: Record<string, Code> = {
      context: variables.context,
      graph: variables.graph,
      focusResource: variables.focusResource,
      preferredLanguages: variables.preferredLanguages,
      propertyPath: this.rdfjsTermExpression(rdf.subject),
      schema: code`schema.properties.${this.name}.type`,
    };
    if (this.configuration.features.has("ObjectSet")) {
      options["objectSet"] = variables.objectSet;
    }

    return Maybe.of(
      code`${this.name}: ${this.type.fromRdfResourceValuesFunction}(
          new ${this.reusables.imports.Resource}.Value(${{ dataFactory: this.reusables.imports.dataFactory, focusResource: variables.focusResource, propertyPath: this.rdfjsTermExpression(rdf.subject), term: code`${variables.focusResource}.identifier` }}).toValues(),
          ${options}
        ).chain(values => values.head())`,
    );
  }

  override hashStatements({
    variables,
  }: Parameters<
    AbstractProperty<IdentifierType>["hashStatements"]
  >[0]): readonly Code[] {
    return [
      code`if (${variables.value}) { ${variables.hasher}.update(${variables.value}.value); }`,
    ];
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
        schema: this.objectType.name
          .map(
            (objectTypeAlias) =>
              code`${objectTypeAlias}.schema.properties.${this.name}.type`,
          )
          .orDefault(this.type.schema),
        valueVariable: variables.focusIdentifier,
        variablePrefix: variables.variablePrefix, // Unused
      }})`,
    });
  }

  override toJsonInitializer({
    variables,
  }: Parameters<
    AbstractProperty<IdentifierType>["toJsonInitializer"]
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

  override toStringInitializer(
    parameters: Parameters<
      AbstractProperty<IdentifierType>["toStringInitializer"]
    >[0],
  ): Maybe<Code> {
    return Maybe.of(
      code`${literalOf(this.name)}: ${this.type.toStringExpression(parameters)}`,
    );
  }
}
