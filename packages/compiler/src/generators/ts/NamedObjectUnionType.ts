import { PropertyPath } from "@rdfx/resource";
import { pascalCase } from "change-case";
import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { NamedObjectType_objectSetMethodNames } from "./_NamedObjectType/NamedObjectType_objectSetMethodNames.js";
import { NamedObjectType_sparqlConstructQueryFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_sparqlConstructQueryFunctionDeclaration.js";
import { NamedObjectType_sparqlConstructQueryStringFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_sparqlConstructQueryStringFunctionDeclaration.js";
import { AbstractNamedUnionType } from "./AbstractNamedUnionType.js";
import { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";

import type { NamedObjectType } from "./NamedObjectType.js";
import { singleEntryRecord } from "./singleEntryRecord.js";

import type { Type } from "./Type.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";

export class NamedObjectUnionType extends AbstractNamedUnionType<NamedObjectType> {
  readonly #identifierType: BlankNodeType | IdentifierType | IriType;

  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly kind = "NamedObjectUnionType";

  constructor({
    identifierType,
    ...superParameters
  }: {
    identifierType: BlankNodeType | IdentifierType | IriType;
  } & Omit<
    ConstructorParameters<typeof AbstractNamedUnionType<NamedObjectType>>[0],
    "identifierType"
  >) {
    super({ ...superParameters, identifierType: Maybe.of(identifierType) });
    this.#identifierType = identifierType;
  }

  @Memoize()
  override get graphqlType(): AbstractType.GraphqlType {
    return new AbstractType.GraphqlType(
      code`${this._name}.GraphQL`,
      this.reusables,
    );
  }

  @Memoize()
  get identifierTypeAlias(): Code {
    return code`${this.name}.Identifier`;
  }

  @Memoize()
  get objectSetMethodNames(): NamedObjectType.ObjectSetMethodNames {
    return NamedObjectType_objectSetMethodNames.call({
      configuration: this.configuration,
      name: this.name,
    });
  }

  @Memoize()
  override get schema(): Code {
    return code`${this.name}.schema`;
  }

  @Memoize()
  override get schemaType(): Code {
    return code`typeof ${this.schema}`;
  }

  protected override get staticModuleDeclarations(): Record<string, Code> {
    return {
      ...super.staticModuleDeclarations,
      ...this.identifierTypeDeclarations,
      ...this.focusSparqlConstructTriplesFunctionDeclaration,
      ...this.focusSparqlWherePatternsFunctionDeclaration,
      ...this.fromRdfResourceFunctionDeclaration,
      ...this.graphqlTypeVariableStatement,
      ...this.isTypeFunctionDeclaration,
      ...this.schemaVariableStatement,
      ...NamedObjectType_sparqlConstructQueryFunctionDeclaration.call({
        configuration: this.configuration,
        filterType: this.filterType,
        name: this.name,
        reusables: this.reusables,
      })
        .map((code_) => singleEntryRecord(`sparqlConstructQuery`, code_))
        .orDefault({}),
      ...NamedObjectType_sparqlConstructQueryStringFunctionDeclaration.call({
        configuration: this.configuration,
        filterType: this.filterType,
        name: this.name,
        reusables: this.reusables,
      })
        .map((code_) => singleEntryRecord(`sparqlConstructQueryString`, code_))
        .orDefault({}),
      ...this.toRdfResourceFunctionDeclaration,
    };
  }

  private get focusSparqlConstructTriplesFunctionDeclaration(): Record<
    string,
    Code
  > {
    if (!this.configuration.features.has("sparql")) {
      return {};
    }

    return singleEntryRecord(
      `focusSparqlConstructTriples`,
      code`\
export function focusSparqlConstructTriples({ filter, focusIdentifier, variablePrefix }: { filter: ${this.filterType} | undefined; focusIdentifier: ${this.reusables.imports.NamedNode} | ${this.reusables.imports.Variable}; ignoreRdfType: boolean; variablePrefix: string }): readonly ${this.reusables.imports.sparqljs}.Triple[] {
  return [${joinCode(
    this.members.map(
      (member) =>
        code`...${member.type.name}.focusSparqlConstructTriples({ filter: filter?.on?.${member.type.name}, focusIdentifier, ignoreRdfType: false, variablePrefix: \`\${variablePrefix}${pascalCase(member.type.name)}\` }).concat()`,
    ),
    { on: ", " },
  )}];
}`,
    );
  }

  private get focusSparqlWherePatternsFunctionDeclaration(): Record<
    string,
    Code
  > {
    if (!this.configuration.features.has("sparql")) {
      return {};
    }

    return singleEntryRecord(
      `focusSparqlWherePatterns`,
      code`\
export function focusSparqlWherePatterns({ filter, focusIdentifier, preferredLanguages, variablePrefix }: { filter: ${this.filterType} | undefined; focusIdentifier: ${this.reusables.imports.NamedNode} | ${this.reusables.imports.Variable}; ignoreRdfType: boolean; preferredLanguages: readonly string[] | undefined; variablePrefix: string }): readonly ${this.reusables.snippets.SparqlPattern}[] {
${joinCode([
  code`let patterns: ${this.reusables.snippets.SparqlPattern}[] = [];`,
  code`\
if (focusIdentifier.termType === "Variable") {
  patterns = patterns.concat(${this.#identifierType.valueSparqlWherePatternsFunction}({
      filter: filter?.${this.configuration.syntheticNamePrefix}identifier,
      ignoreRdfType: false,
      preferredLanguages,
      propertyPatterns: [],
      schema: ${this.#identifierType.schema},
      valueVariable: focusIdentifier,
      variablePrefix,
  }));
}`,
  code`patterns.push({ patterns: [${joinCode(
    this.members.map(
      (member) =>
        code`${{
          patterns: code`${member.type.name}.focusSparqlWherePatterns({ filter: filter?.on?.${member.type.name}, focusIdentifier, ignoreRdfType: false, preferredLanguages, variablePrefix: \`\${variablePrefix}${pascalCase(member.type.name)}\` }).concat()`,
          type: literalOf("group"),
        }}`,
    ),
    { on: ", " },
  )}], type: "union" });`,
  code`return patterns;`,
])}
}`,
    );
  }

  private get fromRdfResourceFunctionDeclaration(): Record<string, Code> {
    if (!this.configuration.features.has("rdf")) {
      return {};
    }

    return singleEntryRecord(
      `fromRdfResource`,
      code`\
export const fromRdfResource: ${this.reusables.snippets.FromRdfResourceFunction}<${this.name}> = (resource, options) => 
  ${this.members.reduce(
    (expression, member) => {
      const memberTypeExpression = code`(${member.type.name}.fromRdfResource(resource, { ...options, ignoreRdfType: false }) as ${this.reusables.imports.Either}<Error, ${this.name}>)`;
      return expression !== null
        ? code`${expression}.altLazy(() => ${memberTypeExpression})`
        : memberTypeExpression;
    },
    null as Code | null,
  )};`,
    );
  }

  private get graphqlTypeVariableStatement(): Record<string, Code> {
    if (!this.configuration.features.has("graphql")) {
      return {};
    }

    return singleEntryRecord(
      `GraphQL`,
      code`\
export const GraphQL = new ${this.reusables.imports.GraphQLUnionType}(${{
        description: this.comment.map(JSON.stringify).extract(),
        name: this.name,
        resolveType: code`(value: ${this.name}) => value.${this.configuration.syntheticNamePrefix}type`,
        types: code`[${joinCode(
          this.members.map((member) => member.type.graphqlType.nullableName),
          { on: ", " },
        )}]`,
      }});`,
    );
  }

  private get identifierTypeDeclarations(): Record<string, Code> {
    return singleEntryRecord(
      `Identifier`,
      code`\
export type Identifier = ${this.#identifierType.name};
export namespace Identifier {
  export const parse = ${this.#identifierType.parseFunction};
  export const stringify = ${this.#identifierType.stringifyFunction};
}`,
    );
  }

  private get isTypeFunctionDeclaration(): Record<string, Code> {
    if (this._name === `${this.configuration.syntheticNamePrefix}Object`) {
      return {};
    }

    return singleEntryRecord(
      `is${this._name}`,
      code`\
    export function is${this._name}(object: ${this.configuration.syntheticNamePrefix}Object): object is ${this.name} {
      return ${joinCode(
        this.members.map(
          (member) => code`${member.type.name}.is${member.type.name}(object)`,
        ),
        { on: " || " },
      )};
    }`,
    );
  }

  private get schemaVariableStatement(): Record<string, Code> {
    const commonPropertiesByName: Record<
      string,
      {
        memberTypesWithProperty: boolean[];
        property: NamedObjectType.ShaclProperty<Type>;
      }
    > = {};

    this.members.forEach((member, memberI) => {
      for (const memberTypeProperty of member.type.properties.concat(
        member.type.ancestorObjectTypes.flatMap(
          (ancestorObjectType) => ancestorObjectType.properties,
        ),
      )) {
        if (memberTypeProperty.kind !== "ShaclProperty") {
          continue;
        }
        let commonProperty = commonPropertiesByName[memberTypeProperty.name];
        if (commonProperty) {
          if (
            PropertyPath.equals(
              commonProperty.property.path,
              memberTypeProperty.path,
            )
          ) {
            commonProperty.memberTypesWithProperty[memberI] = true;
          }
        } else {
          commonPropertiesByName[memberTypeProperty.name] = commonProperty = {
            memberTypesWithProperty: new Array<boolean>(
              this.members.length,
            ).fill(false),
            property: memberTypeProperty,
          };
          commonProperty.memberTypesWithProperty[memberI] = true;
        }
      }
    });

    const propertiesObject: Code[] = [];
    for (const name of Object.keys(commonPropertiesByName).toSorted()) {
      const { memberTypesWithProperty, property } =
        commonPropertiesByName[name];
      if (!memberTypesWithProperty.every((value) => value)) {
        continue;
      }
      propertiesObject.push(code`${property.name}: ${property.schema}`);
    }

    return singleEntryRecord(
      `schema`,
      code`\
export const schema =
${{
  ...super.schemaObject,
  properties: code`{ ${joinCode(propertiesObject, { on: ", " })} }`,
}} as const;`,
    );
  }

  private get toRdfResourceFunctionDeclaration(): Record<string, Code> {
    if (!this.configuration.features.has("rdf")) {
      return {};
    }

    return singleEntryRecord(
      `toRdfResource`,
      code`\
export const toRdfResource: ${this.reusables.snippets.ToRdfResourceFunction}<${this.name}> = (object, options) => {
${joinCode(
  this.members
    .map(
      (member) =>
        code`if (${member.type.name}.is${member.type.name}(object)) { return ${member.type.name}.toRdfResource(object, options); }`,
    )
    .concat(code`throw new Error("unrecognized type");`),
)}
};`,
    );
  }

  override graphqlResolveExpression({
    variables,
  }: {
    variables: { value: Code };
  }): Code {
    return variables.value;
  }
}
