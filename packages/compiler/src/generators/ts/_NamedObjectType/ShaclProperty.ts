import type { PropertyPath } from "@rdfx/resource";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { codeEquals } from "../codeEquals.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";
import { tsComment } from "../tsComment.js";
import { AbstractProperty } from "./AbstractProperty.js";

export class ShaclProperty<TypeT extends Type> extends AbstractProperty<TypeT> {
  private readonly comment: Maybe<string>;
  private readonly description: Maybe<string>;
  private readonly display: boolean;
  private readonly label: Maybe<string>;

  override readonly kind = "ShaclProperty";
  override readonly mutable: boolean;
  readonly path: PropertyPath;
  override readonly recursive: boolean;

  constructor({
    comment,
    description,
    display,
    label,
    mutable,
    path,
    recursive,
    ...superParameters
  }: {
    comment: Maybe<string>;
    description: Maybe<string>;
    display: boolean;
    label: Maybe<string>;
    mutable: boolean;
    path: PropertyPath;
    recursive: boolean;
  } & ConstructorParameters<typeof AbstractProperty<TypeT>>[0]) {
    super(superParameters);
    this.comment = comment;
    this.description = description;
    this.display = display;
    this.label = label;
    this.mutable = mutable;
    this.path = path;
    this.recursive = recursive;
  }

  @Memoize()
  override get constructorParameter(): Maybe<Code> {
    let hasQuestionToken = false;

    const typeNames: Code[] = [];
    for (const type of this.type.conversionFunction.sourceTypes) {
      if (type.typeof === "undefined") {
        hasQuestionToken = true;
      } else {
        typeNames.push(code`${type.name}`);
      }
    }

    return Maybe.of(
      code`readonly ${this.name}${hasQuestionToken ? "?" : ""}: ${joinCode(typeNames, { on: "|" })};`,
    );
  }

  @Memoize()
  override get declaration(): Code {
    const lhs: Code[] = [];
    if (!this.mutable) {
      lhs.push(code`readonly`);
    }
    lhs.push(code`${this.name}`);
    return code`${this.comment
      .alt(this.description)
      .alt(this.label)
      .map(tsComment)
      .orDefault("")}${joinCode(lhs, { on: " " })}: ${this.type.name};`;
  }

  @Memoize()
  override get filterProperty() {
    return Maybe.of({
      name: this.name,
      type: this.type.filterType,
    });
  }

  @Memoize()
  override get graphqlField(): AbstractProperty<TypeT>["graphqlField"] {
    const args = this.type.graphqlArgs;
    const argsVariable = args.isJust() ? code`args` : code`_args`;
    return Maybe.of({
      args,
      description: this.comment.map(JSON.stringify),
      name: this.name,
      resolve: code`(source, ${argsVariable}) => ${this.type.graphqlResolveExpression({ variables: { args: argsVariable, value: code`source.${this.name}` } })}`,
      type: this.type.graphqlType.name,
    });
  }

  @Memoize()
  override get jsonSchema(): AbstractProperty<TypeT>["jsonSchema"] {
    let schema = this.type.jsonSchema({
      context: "property",
    });

    const meta: Record<string, string> = {
      // id: `${this.namedObjectType.name}-${this.name}`, // id's must be unique
    };
    this.comment.alt(this.description).ifJust((description) => {
      meta["description"] = description;
    });
    this.label.ifJust((label) => {
      meta["title"] = label;
    });
    schema = code`${schema}.meta(${meta})`;

    return Maybe.of({
      key: this.name,
      schema,
    });
  }

  @Memoize()
  override get jsonSignature(): Maybe<Code> {
    const typeJsonType = this.type.jsonType();
    return Maybe.of(
      code`${!this.mutable ? "readonly " : ""}${this.name}${typeJsonType.optional ? "?" : ""}: ${typeJsonType.requiredName}`,
    );
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      // comment: this.comment.map(JSON.stringify).extract(),
      // description: this.description.map(JSON.stringify).extract(),
      path: this.configuration.features.has("rdf")
        ? this.propertyPathToCode(this.path)
        : undefined,
      // label: this.label.map(JSON.stringify).extract(),
      // mutable: this.mutable ? true : undefined,
      // recursive: this.recursive ? true : undefined,
      // visibility:
      //   this.visibility !== "public"
      //     ? `${JSON.stringify(this.visibility)} as const`
      //     : undefined,
    };
  }

  override constructorInitializer({
    variables,
  }: Parameters<
    AbstractProperty<TypeT>["constructorInitializer"]
  >[0]): Maybe<Code> {
    return Maybe.of(
      code`${this.name}: ${this.type.conversionFunction.code}(schema.properties.${this.name}.type(), ${variables.parameters}.${this.name})`,
    );
  }

  override fromJsonInitializer({
    variables,
  }: Parameters<
    AbstractProperty<TypeT>["fromJsonInitializer"]
  >[0]): Maybe<Code> {
    return Maybe.of(
      code`${this.name}: ${this.type.fromJsonExpression({
        variables: { value: code`${variables.jsonObject}["${this.name}"]` },
      })}`,
    );
  }

  override fromRdfResourceValuesInitializer({
    variables,
  }: Parameters<
    AbstractProperty<TypeT>["fromRdfResourceValuesInitializer"]
  >[0]): Maybe<Code> {
    // Assume the property has the correct range and ignore the object's RDF type.
    // This also accommodates the case where the object of a property is a dangling identifier that's not the
    // subject of any statements.

    return Maybe.of(
      code`${this.name}: ${this.reusables.snippets.shaclPropertyFromRdf}(${{
        graph: variables.graph,
        resource: variables.resource,
        propertySchema: code`schema.properties.${this.name}`,
        typeFromRdf: code`((resourceValues) => ${this.type.fromRdfResourceValuesExpression(
          {
            variables: {
              ...variables,
              ignoreRdfType: true,
              propertyPath: code`${this.namedObjectType.name}.schema.properties.${this.name}.path`,
              resourceValues: code`resourceValues`,
            },
          },
        )})`,
      }})`,
    );
  }

  override hashStatements({
    variables,
  }: Parameters<
    AbstractProperty<TypeT>["hashStatements"]
  >[0]): readonly Code[] {
    return [
      code`${this.type.hashFunction}(${variables.hasher}, ${variables.value});`,
    ];
  }

  jsonUiSchemaElement({
    variables,
  }: Parameters<
    AbstractProperty<TypeT>["jsonUiSchemaElement"]
  >[0]): Maybe<Code> {
    const scope = code`\`\${${variables.scopePrefix}}/properties/${this.name}\``;
    return this.type
      .jsonUiSchemaElement({ variables: { scopePrefix: scope } })
      .altLazy(() =>
        Maybe.of(
          code`{ ${this.label.isJust() ? `label: "${this.label.unsafeCoerce()}", ` : ""}scope: ${scope}, type: "Control" }`,
        ),
      );
  }

  override sparqlConstructTriplesExpression({
    variables,
  }: Parameters<
    AbstractProperty<TypeT>["sparqlConstructTriplesExpression"]
  >[0]): Maybe<Code> {
    return Maybe.of(
      code`${this.reusables.snippets.shaclPropertySparqlConstructTriples}(${{
        filter: this.filterProperty
          .map(({ name }) => code`${variables.filter}?.${name}`)
          .extract(),
        focusIdentifier: variables.focusIdentifier,
        ignoreRdfType: true,
        propertyName: this.name,
        propertySchema: code`schema.properties.${this.name}`,
        typeSparqlConstructTriples:
          this.type.valueSparqlConstructTriplesFunction,
        variablePrefix: variables.variablePrefix,
      }})`,
    );
  }

  override sparqlWherePatternsExpression({
    variables,
  }: Parameters<
    AbstractProperty<TypeT>["sparqlWherePatternsExpression"]
  >[0]): ReturnType<AbstractProperty<TypeT>["sparqlWherePatternsExpression"]> {
    return Maybe.of({
      patterns: code`${this.reusables.snippets.shaclPropertySparqlWherePatterns}(${{
        filter: this.filterProperty
          .map(({ name }) => code`${variables.filter}?.${name}`)
          .extract(),
        focusIdentifier: variables.focusIdentifier,
        ignoreRdfType: true,
        preferredLanguages: variables.preferredLanguages,
        propertyName: this.name,
        propertySchema: code`schema.properties.${this.name}`,
        typeSparqlWherePatterns: this.type.valueSparqlWherePatternsFunction,
        variablePrefix: variables.variablePrefix,
      }})`,
    });
  }

  override toJsonInitializer(
    parameters: Parameters<AbstractProperty<TypeT>["toJsonInitializer"]>[0],
  ): Maybe<Code> {
    return Maybe.of(
      code`${this.name}: ${this.type.toJsonExpression(parameters)}`,
    );
  }

  override toRdfRdfResourceValuesStatements({
    variables,
  }: Parameters<
    AbstractProperty<TypeT>["toRdfRdfResourceValuesStatements"]
  >[0]): readonly Code[] {
    switch (this.path.termType) {
      case "NamedNode":
        break;
      case "InversePath":
        if (this.path.path.termType === "NamedNode") {
          break;
        }
        return [];
      default:
        return [];
    }

    const propertyPath = this.propertyPathToCode(this.path);
    return [
      code`${variables.resource}.add(${propertyPath}, ${this.type.toRdfResourceValuesExpression(
        {
          variables: { ...variables, propertyPath },
        },
      )}, ${variables.graph});`,
    ];
  }

  override toStringInitializer(
    parameters: Parameters<AbstractProperty<TypeT>["toStringInitializer"]>[0],
  ): Maybe<Code> {
    if (!this.display) {
      return Maybe.empty();
    }
    return Maybe.of(
      code`${literalOf(this.name)}: ${this.type.toStringExpression(parameters)}`,
    );
  }

  private propertyPathToCode(propertyPath: PropertyPath): Code {
    switch (propertyPath.termType) {
      case "AlternativePath":
      case "SequencePath":
        return code`{ members: [${joinCode(
          propertyPath.members.map((member) => this.propertyPathToCode(member)),
          { on: "," },
        )}] as const, termType: ${literalOf(propertyPath.termType)} as const }`;
      case "InversePath":
      case "OneOrMorePath":
      case "ZeroOrMorePath":
      case "ZeroOrOnePath":
        return code`{ path: ${this.propertyPathToCode(propertyPath.path)}, termType: ${literalOf(propertyPath.termType)} as const }`;
      case "NamedNode":
        return this.rdfjsTermExpression(propertyPath);
    }
  }
}
