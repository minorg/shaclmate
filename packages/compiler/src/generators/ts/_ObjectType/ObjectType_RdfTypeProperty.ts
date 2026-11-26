import type { NamedNode } from "@rdfjs/types";
import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";

import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import type { CodeThunk } from "../CodeThunk.js";
import { SchemaObject } from "../SchemaObject.js";
import {
  arrayOf,
  type Code,
  code,
  joinCode,
  literalOf,
} from "../ts-poet-wrapper.js";
import { ObjectType_AbstractProperty } from "./ObjectType_AbstractProperty.js";

export class ObjectType_RdfTypeProperty extends ObjectType_AbstractProperty {
  override readonly createFunctionParameter: ObjectType_AbstractProperty["createFunctionParameter"] =
    Maybe.empty();
  override readonly declaration: ObjectType_AbstractProperty["declaration"] =
    Maybe.empty();
  override readonly filterProperty: ObjectType_AbstractProperty["filterProperty"] =
    Maybe.empty();
  readonly fromRdfType: Maybe<NamedNode>;
  override readonly graphqlField: ObjectType_AbstractProperty["graphqlField"] =
    Maybe.empty();
  override readonly hashFunctionParameter: ObjectType_AbstractProperty["hashFunctionParameter"] =
    Maybe.empty();
  override readonly kind = "RdfType";
  override readonly mutable = false;
  override readonly recursive = false;
  readonly toRdfTypes: readonly NamedNode[];

  constructor({
    configuration,
    fromRdfType,
    toRdfTypes,
    ...superParameters
  }: {
    fromRdfType: Maybe<NamedNode>;
    toRdfTypes: readonly NamedNode[];
  } & Omit<
    ConstructorParameters<typeof ObjectType_AbstractProperty>[0],
    "name"
  >) {
    super({
      ...superParameters,
      configuration,
      name: `${configuration.syntheticNamePrefix}rdfType`,
    });
    this.fromRdfType = fromRdfType;
    this.toRdfTypes = toRdfTypes;
    invariant(toRdfTypes.length > 0);
    fromRdfType.ifJust((fromRdfType) => {
      invariant(toRdfTypes.some((toRdfType) => toRdfType.equals(fromRdfType)));
    });
  }

  @Memoize()
  get jsonObjectMember(): ObjectType_AbstractProperty["jsonObjectMember"] {
    return Maybe.of({
      description: Maybe.empty(),
      label: Maybe.empty(),
      name: "@type",
      optional: false,
      recursive: this.recursive,
      type:
        this.toRdfTypes.length === 1
          ? this.jsonTypeFactory.createJsonStringType({
              default: this.toRdfTypes[0].value,
            })
          : this.jsonTypeFactory.createJsonArrayType(
              this.jsonTypeFactory.createJsonStringType(),
              {
                default: this.toRdfTypes.map((toRdfType) => toRdfType.value),
                minCount: 1n,
              },
            ),
      uiSchemaElement: Maybe.empty(),
    });
  }

  @Memoize()
  override get schema(): Maybe<SchemaObject<SchemaObject.UserDefinedType>> {
    return Maybe.of(this._schema);
  }

  @Memoize()
  private get _schema(): SchemaObject<SchemaObject.UserDefinedType> {
    const properties: Record<string, CodeThunk> = {
      kind: code`kind: ${literalOf(this.kind)}`,
      toRdfTypes: code`toRdfTypes: ${arrayOf(...this.toRdfTypes.map((toRdfType) => this.rdfjsTermExpression(toRdfType)))}`,
    };
    const typeMembers: Record<string, CodeThunk> = {
      kind: code`kind: ${literalOf(this.kind)}`,
      toRdfTypes: code`toRdfTypes: readonly ${this.reusables.imports.NamedNode}[]`,
    };
    this.fromRdfType.ifJust((fromRdfType) => {
      properties["fromRdfType"] =
        code`fromRdfType: ${this.rdfjsTermExpression(fromRdfType)}`;
      typeMembers["fromRdfType"] =
        code`fromRdfType: ${this.reusables.imports.NamedNode}`;
    });

    return new SchemaObject({
      properties,
      type: new SchemaObject.UserDefinedType({
        members: typeMembers,
        name: Maybe.empty(),
      }),
      variable: this.schemaVariable,
    });
  }

  override createInitializer(): Maybe<Code> {
    return Maybe.empty();
  }

  @Memoize()
  override equalsExpression(): Maybe<Code> {
    return Maybe.empty();
  }

  @Memoize()
  override filterExpression(): Maybe<Code> {
    return Maybe.empty();
  }

  override fromJsonObjectInitializer(): Maybe<Code> {
    return Maybe.empty();
  }

  override fromRdfResourceValuesInitializer({
    variables,
  }: Parameters<
    ObjectType_AbstractProperty["fromRdfResourceValuesInitializer"]
  >[0]): Maybe<Code> {
    return this.fromRdfType.map(
      () =>
        code`${this.name}: !${variables.ignoreRdfType} ? ${this.reusables.snippets.ensureRdfResourceType}(${variables.focusResource}, ${arrayOf(
          code`(${this._schema.expression}).fromRdfType`,
        )}, ${{ graph: variables.graph }}) : ${this.reusables.imports.Right}(true as const)`,
    );
  }

  override hashStatements(): readonly Code[] {
    return [];
  }

  override sparqlConstructTriplesExpression({
    variables,
  }: Parameters<
    ObjectType_AbstractProperty["sparqlConstructTriplesExpression"]
  >[0]): Maybe<Code> {
    const rdfClassVariable = code`${this.reusables.imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}RdfClass\`)`;
    const rdfTypeVariable = code`${this.reusables.imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}RdfType\`)`;
    return Maybe.of(
      code`${variables.ignoreRdfType} ? [] : [${joinCode(
        [
          code`{ subject: ${variables.focusIdentifier}, predicate: ${this.rdfjsTermExpression(rdf.type)}, object: ${rdfTypeVariable} }`,
          code`{ subject: ${rdfTypeVariable}, predicate: ${this.rdfjsTermExpression(rdfs.subClassOf)}, object: ${rdfClassVariable} }`,
        ],
        {
          on: ",",
        },
      )}]`,
    );
  }

  override sparqlWherePatternsExpression({
    variables,
  }: Parameters<
    ObjectType_AbstractProperty["sparqlWherePatternsExpression"]
  >[0]): ReturnType<
    ObjectType_AbstractProperty["sparqlWherePatternsExpression"]
  > {
    const rdfClassVariable = code`${this.reusables.imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}RdfClass\`)`;
    const rdfTypeVariable = code`${this.reusables.imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}RdfType\`)`;

    let patterns: Code[] = [];
    this.fromRdfType.ifJust((fromRdfType) => {
      patterns.push(
        code`${this.reusables.snippets.sparqlInstancesOfPattern}({ rdfType: ${variables.schema.map((schema) => code`${schema}.properties.${this.name}.fromRdfType`).orDefault(this.rdfjsTermExpression(fromRdfType))}, subject: ${variables.focusIdentifier} })`,
      );
    }); // else if there are only toRdfTypes, still want to pull in rdf:type on the instance so we can recreate it with CONSTRUCT.
    // Pull in any rdf:type on the instance.
    patterns = patterns.concat(
      code`{ triples: [{ subject: ${variables.focusIdentifier}, predicate: ${this.rdfjsTermExpression(rdf.type)}, object: ${rdfTypeVariable} }], type: "bgp" as const }`,
      code`{
patterns: [
  {
    triples: [
      {
        subject: ${rdfTypeVariable},
        predicate: {
          items: [${this.rdfjsTermExpression(rdfs.subClassOf)}],
          pathType: "+" as const,
          type: "path" as const
        },
        object: ${rdfClassVariable}
      }
    ],
    type: "bgp" as const
  }
],
type: "optional" as const
}`,
    );

    return Maybe.of({
      patterns: code`${variables.ignoreRdfType} ? [] : [${joinCode(patterns, {
        on: ",",
      })}]`,
    });
  }

  @Memoize()
  override toJsonObjectInitializer(): Maybe<Code> {
    return Maybe.of(
      code`"@type":
          ${
            this.toRdfTypes.length === 1
              ? code`${literalOf(this.toRdfTypes[0].value)}`
              : code`${arrayOf(...this.toRdfTypes.map((toRdfType) => toRdfType.value))}`
          }`,
    );
  }

  override toLoggableInitializer(): Maybe<Code> {
    return Maybe.empty();
  }

  override toRdfResourceValuesStatements({
    variables,
  }: Parameters<
    ObjectType_AbstractProperty["toRdfResourceValuesStatements"]
  >[0]): readonly Code[] {
    return [
      code`\
if (!${variables.ignoreRdfType}) {
  ${variables.resource}.add(${this.rdfjsTermExpression(rdf.type)}, ${this._schema.expression}.toRdfTypes, ${variables.graph});
}`,
    ];
  }

  override toStringInitializer(): Maybe<Code> {
    return Maybe.empty();
  }
}
