import type { PropertyPath } from "@rdfx/resource";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import type { Type } from "../Type.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";
import { tsComment } from "../tsComment.js";
import { ObjectType_AbstractProperty } from "./ObjectType_AbstractProperty.js";

export class ObjectType_ShaclProperty<
  TypeT extends Type,
> extends ObjectType_AbstractProperty {
  private readonly comment: Maybe<string>;
  private readonly description: Maybe<string>;
  private readonly display: boolean;
  private readonly label: Maybe<string>;

  override readonly kind = "Shacl";
  override readonly mutable: boolean;
  readonly path: PropertyPath;
  override readonly recursive: boolean;
  readonly type: TypeT;

  constructor({
    comment,
    description,
    display,
    label,
    mutable,
    path,
    recursive,
    type,
    ...superParameters
  }: {
    comment: Maybe<string>;
    description: Maybe<string>;
    display: boolean;
    label: Maybe<string>;
    mutable: boolean;
    path: PropertyPath;
    recursive: boolean;
    type: TypeT;
  } & ConstructorParameters<typeof ObjectType_AbstractProperty>[0]) {
    super(superParameters);
    this.comment = comment;
    this.description = description;
    this.display = display;
    this.label = label;
    this.mutable = mutable;
    this.path = path;
    this.recursive = recursive;
    this.type = type;
  }

  @Memoize()
  override get constructorParameter(): Maybe<{
    hasQuestionToken: boolean;
    signature: Code;
  }> {
    const conversionFunction = this.type.conversionFunction.extract();

    if (!conversionFunction) {
      return Maybe.of({
        hasQuestionToken: false,
        signature: code`readonly ${this.name}: ${this.type.expression};`,
      });
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

    return Maybe.of({
      hasQuestionToken,
      signature: code`readonly ${this.name}${hasQuestionToken ? "?" : ""}: ${joinCode(typeExpressions, { on: "|" })};`,
    });
  }

  @Memoize()
  override get declaration(): Maybe<Code> {
    let declaration = code`${!this.mutable ? "readonly " : ""}${this.name}: ${this.type.expression};`;
    this.comment
      .alt(this.description)
      .alt(this.label)
      .map(tsComment)
      .ifJust((comment) => {
        declaration = code`${comment}${declaration}`;
      });
    return Maybe.of(declaration);
  }

  @Memoize()
  override get filterProperty() {
    return Maybe.of({
      name: this.name,
      type: this.type.filterType,
    });
  }

  @Memoize()
  override get graphqlField(): ObjectType_AbstractProperty["graphqlField"] {
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

  override get hashFunctionParameter(): Maybe<Code> {
    return this.declaration;
  }

  @Memoize()
  override get jsonSchema(): ObjectType_AbstractProperty["jsonSchema"] {
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
    if (Object.keys(meta).length > 0) {
      schema = code`${schema}.meta(${meta})`;
    }

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

  @Memoize()
  private get schemaVariable(): Code {
    return this.objectType.name
      .map((name) => code`${name}.schema.properties.${this.name}`)
      .orDefaultLazy(() => this.schema.unsafeCoerce());
  }

  private get typeSchemaVariable(): Code {
    return this.objectType.name
      .map((name) => code`${name}.schema.properties.${this.name}.type`)
      .orDefaultLazy(() => this.type.schema);
  }

  override constructorInitializer({
    variables,
  }: Parameters<
    ObjectType_AbstractProperty["constructorInitializer"]
  >[0]): Maybe<Code> {
    const parameterVariable = code`${variables.parameters}.${this.name}`;
    const defaultNamespaceVariable = code`${variables.parameters}.${this.configuration.syntheticNamePrefix}defaultNamespace`;

    const conversionFunction = this.type.conversionFunction.extract()?.code;
    const validationFunction = this.type.validationFunction.extract();
    let rhs: Code;
    if (conversionFunction && validationFunction) {
      rhs = code`${conversionFunction}(${parameterVariable}, ${defaultNamespaceVariable}).chain(value => ${validationFunction}(${this.typeSchemaVariable}, value))`;
    } else if (conversionFunction) {
      rhs = code`${conversionFunction}(${parameterVariable}, ${defaultNamespaceVariable})`;
    } else if (validationFunction) {
      rhs = code`${validationFunction}(${this.typeSchemaVariable}, ${parameterVariable})`;
    } else {
      rhs = code`${this.reusables.imports.Either}.of(${parameterVariable})`;
    }

    return Maybe.of(code`${this.name}: ${rhs}`);
  }

  override equalsExpression({
    variables,
  }: Parameters<
    ObjectType_AbstractProperty["equalsExpression"]
  >[0]): Maybe<Code> {
    return Maybe.of(code`${this.reusables.snippets.propertyEquals}(
        { equalsFunction: ${this.type.equalsFunction}, name: ${literalOf(this.name)} },
        [left, ${variables.leftObject}.${this.name}],
        [right, ${variables.rightObject}.${this.name}],
      )`);
  }

  override filterExpression({
    variables,
  }: Parameters<
    ObjectType_AbstractProperty["filterExpression"]
  >[0]): Maybe<Code> {
    return Maybe.of(
      code`${this.type.filterFunction}(${variables.filter}.${this.name}, ${variables.object}.${this.name})`,
    );
  }

  override fromJsonInitializer({
    variables,
  }: Parameters<
    ObjectType_AbstractProperty["fromJsonInitializer"]
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
    ObjectType_AbstractProperty["fromRdfResourceValuesInitializer"]
  >[0]): Maybe<Code> {
    return Maybe.of(
      code`${this.name}:
        ${this.reusables.snippets.shaclPropertyFromRdf}<${this.type.expression}, ${this.type.schemaType}>({
          ...${variables.options},
          focusResource: ${variables.focusResource},
          ignoreRdfType: true,
          propertySchema: ${this.schemaVariable},
          typeFromRdfResourceValues: ${this.type.fromRdfResourceValuesFunction} 
        })`,
    );
  }

  override hashStatements({
    variables,
  }: Parameters<
    ObjectType_AbstractProperty["hashStatements"]
  >[0]): readonly Code[] {
    return [
      code`${this.type.hashFunction}(${variables.hasher}, ${variables.object}.${this.name});`,
    ];
  }

  jsonUiSchemaElement({
    variables,
  }: Parameters<
    ObjectType_AbstractProperty["jsonUiSchemaElement"]
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
    ObjectType_AbstractProperty["sparqlConstructTriplesExpression"]
  >[0]): Maybe<Code> {
    return Maybe.of(
      code`${this.reusables.snippets.shaclPropertySparqlConstructTriples}(${{
        filter: this.filterProperty
          .map(({ name }) => code`${variables.filter}?.${name}`)
          .extract(),
        focusIdentifier: variables.focusIdentifier,
        ignoreRdfType: true,
        propertyName: this.name,
        propertySchema: this.schemaVariable,
        typeSparqlConstructTriples:
          this.type.valueSparqlConstructTriplesFunction,
        variablePrefix: variables.variablePrefix,
      }})`,
    );
  }

  override sparqlWherePatternsExpression({
    variables,
  }: Parameters<
    ObjectType_AbstractProperty["sparqlWherePatternsExpression"]
  >[0]): ReturnType<
    ObjectType_AbstractProperty["sparqlWherePatternsExpression"]
  > {
    return Maybe.of({
      patterns: code`${this.reusables.snippets.shaclPropertySparqlWherePatterns}(${{
        filter: this.filterProperty
          .map(({ name }) => code`${variables.filter}?.${name}`)
          .extract(),
        focusIdentifier: variables.focusIdentifier,
        ignoreRdfType: true,
        preferredLanguages: variables.preferredLanguages,
        propertyName: this.name,
        propertySchema: this.schemaVariable,
        typeSparqlWherePatterns: this.type.valueSparqlWherePatternsFunction,
        variablePrefix: variables.variablePrefix,
      }})`,
    });
  }

  override toJsonInitializer({
    variables,
  }: Parameters<
    ObjectType_AbstractProperty["toJsonInitializer"]
  >[0]): Maybe<Code> {
    return Maybe.of(
      code`${this.name}: ${this.type.toJsonExpression({ variables: { value: code`${variables.object}.${this.name}` } })}`,
    );
  }

  override toRdfRdfResourceValuesStatements({
    variables,
  }: Parameters<
    ObjectType_AbstractProperty["toRdfRdfResourceValuesStatements"]
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
      .map(() => code`${this.schemaVariable}.path`)
      .orDefault(this.propertyPathToCode(this.path));

    const { object: objectVariable, ...otherVariables } = variables;

    return [
      code`${variables.resource}.add(${propertyPath}, ${this.type.toRdfResourceValuesExpression(
        {
          variables: {
            ...otherVariables,
            propertyPath,
            value: code`${objectVariable}.${this.name}`,
          },
        },
      )}, ${variables.graph});`,
    ];
  }

  override toStringInitializer({
    variables,
  }: Parameters<
    ObjectType_AbstractProperty["toStringInitializer"]
  >[0]): Maybe<Code> {
    if (!this.display) {
      return Maybe.empty();
    }
    const { object: objectVariable, ...otherVariables } = variables;
    return Maybe.of(
      code`${literalOf(this.name)}: ${this.type.toStringExpression({ variables: { ...otherVariables, value: code`${objectVariable}.${this.name}` } })}`,
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
