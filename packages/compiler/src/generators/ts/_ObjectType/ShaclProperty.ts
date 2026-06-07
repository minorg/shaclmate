import type { PropertyPath } from "@rdfx/resource";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import type { Type } from "../Type.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";
import { tsComment } from "../tsComment.js";
import { AbstractProperty } from "./AbstractProperty.js";

export class ShaclProperty<TypeT extends Type> extends AbstractProperty<TypeT> {
  private readonly comment: Maybe<string>;
  private readonly description: Maybe<string>;
  private readonly display: boolean;
  private readonly label: Maybe<string>;

  override readonly kind = "Shacl";
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
    const conversionFunction = this.type.conversionFunction.extract();

    if (!conversionFunction) {
      return Maybe.of(code`readonly ${this.name}: ${this.type.expression};`);
    }

    let hasQuestionToken = false;

    const typeExpressions: Code[] = [];
    for (const type of conversionFunction.sourceTypes) {
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
    const lhs: Code[] = [];
    if (!this.mutable) {
      lhs.push(code`readonly`);
    }
    lhs.push(code`${this.name}`);
    return code`${this.comment
      .alt(this.description)
      .alt(this.label)
      .map(tsComment)
      .orDefault("")}${joinCode(lhs, { on: " " })}: ${this.type.expression};`;
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
      type: this.type.graphqlType.expression,
    });
  }

  override get hashFunctionParameter(): Code {
    return this.declaration;
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
      code`${!this.mutable ? "readonly " : ""}${this.name}${typeJsonType.optional ? "?" : ""}: ${typeJsonType.requiredExpression}`,
    );
  }

  override get schema(): Maybe<Code> {
    const initializers = [code`kind: ${literalOf(this.kind)}`];
    if (
      this.configuration.features.has("Object.fromRdf") ||
      this.configuration.features.has("Object.toRdf")
    ) {
      initializers.push(code`path: ${this.propertyPathToCode(this.path)}`);
    }
    // Use a getter if the type is recursive or the type is an object type, which may have forward references in the file
    if (this.recursive || this.type.referencesNamedType) {
      initializers.push(code`get type() { return ${this.type.schema}; }`);
    } else {
      initializers.push(code`type: ${this.type.schema}`);
    }
    return Maybe.of(code`{ ${joinCode(initializers, { on: ", " })} }`);
  }

  override get schemaType(): Maybe<Code> {
    const initializers = [code`readonly kind: ${literalOf(this.kind)}`];
    if (
      this.configuration.features.has("Object.fromRdf") ||
      this.configuration.features.has("Object.toRdf")
    ) {
      initializers.push(
        code`readonly path: ${this.reusables.snippets.PropertyPath}`,
      );
    }
    initializers.push(code`readonly type: ${this.type.schemaType}`);
    return Maybe.of(code`{ ${joinCode(initializers, { on: ", " })} }`);
  }

  override constructorInitializer({
    variables,
  }: Parameters<
    AbstractProperty<TypeT>["constructorInitializer"]
  >[0]): Maybe<Code> {
    const parameterVariable = code`${variables.parameters}.${this.name}`;

    const conversionFunction = this.type.conversionFunction.extract()?.code;
    const validationFunction = this.type.validationFunction.extract();
    let rhs: Code;
    const typeSchema = this.objectType.name
      .map((name) => code`${name}.schema.properties.${this.name}.type`)
      .orDefault(this.type.schema);
    if (conversionFunction && validationFunction) {
      rhs = code`${conversionFunction}(${parameterVariable}).chain(value => ${validationFunction}(${typeSchema}, value))`;
    } else if (conversionFunction) {
      rhs = code`${conversionFunction}(${parameterVariable})`;
    } else if (validationFunction) {
      rhs = code`${validationFunction}(${typeSchema}, ${parameterVariable})`;
    } else {
      rhs = code`${this.reusables.imports.Either}.of(${parameterVariable})`;
    }

    return Maybe.of(code`${this.name}: ${rhs}`);
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
    const parameters: Record<string, Code | true> = {
      context: variables.context,
      graph: variables.graph,
      focusResource: variables.focusResource,
      // Assume the property has the correct range and ignore the object's RDF type.
      // This also accommodates the case where the object of a property is a dangling identifier that's not the
      // subject of any statements.
      ignoreRdfType: true,
      preferredLanguages: variables.preferredLanguages,
      propertySchema: code`schema.properties.${this.name}`,
      typeFromRdfResourceValues: this.type.fromRdfResourceValuesFunction,
    };
    if (this.configuration.features.has("ObjectSet")) {
      parameters["objectSet"] = variables.objectSet;
    }

    return Maybe.of(
      code`${this.name}: ${this.reusables.snippets.shaclPropertyFromRdf}<${this.type.expression}, ${this.type.schemaType}>(${parameters})`,
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

    const propertyPath = this.objectType.name
      .map((name) => code`${name}.schema.properties.${this.name}.path`)
      .orDefault(this.propertyPathToCode(this.path));

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
        )}], termType: ${literalOf(propertyPath.termType)} }`;
      case "InversePath":
      case "OneOrMorePath":
      case "ZeroOrMorePath":
      case "ZeroOrOnePath":
        return code`{ path: ${this.propertyPathToCode(propertyPath.path)}, termType: ${literalOf(propertyPath.termType)} }`;
      case "NamedNode":
        return this.rdfjsTermExpression(propertyPath);
    }
  }
}
