import type { NamedNode } from "@rdfjs/types";
import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

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
  readonly fromRdfType: NamedNode;
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
    fromRdfType: NamedNode;
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
  }

  @Memoize()
  override get schema(): Maybe<Code> {
    return Maybe.of(
      code`${{ fromRdfType: this.rdfjsTermExpression(this.fromRdfType), kind: this.kind, toRdfTypes: this.toRdfTypes.map((toRdfType) => this.rdfjsTermExpression(toRdfType)) }}`,
    );
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
          ? this.jsonTypeFactory.createJsonStringType()
          : this.jsonTypeFactory.createJsonArrayType(
              this.jsonTypeFactory.createJsonStringType(),
              {
                minCount: 1n,
              },
            ),
      uiSchemaElement: Maybe.empty(),
    });
  }

  @Memoize()
  override get schemaType(): Maybe<Code> {
    return Maybe.of(
      code`${{ fromRdfType: code`${this.reusables.imports.NamedNode}`, kind: this.kind, toRdfTypes: code`readonly ${this.reusables.imports.NamedNode}[]` }}`,
    );
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
    return Maybe.of(
      code`${this.name}: !${variables.ignoreRdfType} ? ${this.reusables.snippets.ensureRdfResourceType}(${variables.focusResource}, ${arrayOf(
        variables.objectSchema
          .map(
            (schemaVariable) =>
              code`${schemaVariable}.properties.${this.name}.fromRdfType`,
          )
          .orDefaultLazy(() => this.rdfjsTermExpression(this.fromRdfType)),
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
    return Maybe.of({
      patterns: code`${variables.ignoreRdfType} ? [] : [${joinCode(
        [
          code`${this.reusables.snippets.sparqlInstancesOfPattern}({ rdfType: ${variables.schema.map((schema) => code`${schema}.properties.${this.name}.fromRdfType`).orDefault(this.rdfjsTermExpression(this.fromRdfType))}, subject: ${variables.focusIdentifier} })`,
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
        ],
        {
          on: ",",
        },
      )}]`,
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
      code`if (!${variables.ignoreRdfType}) { ${variables.resource}.add(${this.rdfjsTermExpression(rdf.type)}, ${variables.objectSchema
        .map(
          (schemaVariable) =>
            code`${schemaVariable}.properties.${this.name}.toRdfTypes`,
        )
        .orDefaultLazy(
          () =>
            code`${arrayOf(...this.toRdfTypes.map((toRdfType) => this.rdfjsTermExpression(toRdfType)))}`,
        )}, ${variables.graph}); }`,
    ];
  }

  override toStringInitializer(): Maybe<Code> {
    return Maybe.empty();
  }
}
