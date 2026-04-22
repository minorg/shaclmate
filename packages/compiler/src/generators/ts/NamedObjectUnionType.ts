import { pascalCase } from "change-case";
import { Maybe } from "purify-ts";
import { PropertyPath } from "rdfjs-resource";
import { Memoize } from "typescript-memoize";
import { ObjectType_objectSetMethodNames } from "./_NamedObjectType/NamedObjectType_objectSetMethodNames.js";
import { ObjectType_sparqlConstructQueryFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_sparqlConstructQueryFunctionDeclaration.js";
import { ObjectType_sparqlConstructQueryStringFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_sparqlConstructQueryStringFunctionDeclaration.js";
import { AbstractNamedUnionType } from "./AbstractNamedUnionType.js";
import { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";
import { imports } from "./imports.js";
import type { ObjectType } from "./ObjectType.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { snippets } from "./snippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { Type } from "./Type.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";

export class NamedObjectUnionType extends AbstractNamedUnionType<ObjectType> {
  readonly #identifierType: BlankNodeType | IdentifierType | IriType;

  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly kind = "NamedObjectUnionType";

  constructor({
    identifierType,
    ...superParameters
  }: {
    identifierType: BlankNodeType | IdentifierType | IriType;
  } & Omit<
    ConstructorParameters<typeof AbstractNamedUnionType<ObjectType>>[0],
    "identifierType"
  >) {
    super({ ...superParameters, identifierType: Maybe.of(identifierType) });
    this.#identifierType = identifierType;
  }

  @Memoize()
  override get graphqlType(): AbstractType.GraphqlType {
    return new AbstractType.GraphqlType(
      code`${this._name}.${syntheticNamePrefix}GraphQL`,
    );
  }

  @Memoize()
  get identifierTypeAlias(): Code {
    return code`${this.staticModuleName}.${syntheticNamePrefix}Identifier`;
  }

  @Memoize()
  get objectSetMethodNames(): ObjectType.ObjectSetMethodNames {
    return ObjectType_objectSetMethodNames.call(this);
  }

  @Memoize()
  override get schema(): Code {
    return code`${this.staticModuleName}.${syntheticNamePrefix}schema`;
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
      ...ObjectType_sparqlConstructQueryFunctionDeclaration.call(this)
        .map((code_) =>
          singleEntryRecord(
            `${syntheticNamePrefix}sparqlConstructQuery`,
            code_,
          ),
        )
        .orDefault({}),
      ...ObjectType_sparqlConstructQueryStringFunctionDeclaration.call(this)
        .map((code_) =>
          singleEntryRecord(
            `${syntheticNamePrefix}sparqlConstructQueryString`,
            code_,
          ),
        )
        .orDefault({}),
      ...this.toRdfResourceFunctionDeclaration,
    };
  }

  private get focusSparqlConstructTriplesFunctionDeclaration(): Record<
    string,
    Code
  > {
    if (!this.features.has("sparql")) {
      return {};
    }

    return singleEntryRecord(
      `${syntheticNamePrefix}focusSparqlConstructTriples`,
      code`\
export function ${syntheticNamePrefix}focusSparqlConstructTriples({ filter, focusIdentifier, variablePrefix }: { filter: ${this.filterType} | undefined; focusIdentifier: ${imports.NamedNode} | ${imports.Variable}; ignoreRdfType: boolean; variablePrefix: string }): readonly ${imports.sparqljs}.Triple[] {
  return [${joinCode(
    this.concreteMembers.map(
      (member) =>
        code`...${member.type.staticModuleName}.${syntheticNamePrefix}focusSparqlConstructTriples({ filter: filter?.on?.${member.type.name}, focusIdentifier, ignoreRdfType: false, variablePrefix: \`\${variablePrefix}${pascalCase(member.type.name)}\` }).concat()`,
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
    if (!this.features.has("sparql")) {
      return {};
    }

    return singleEntryRecord(
      `${syntheticNamePrefix}focusSparqlWherePatterns`,
      code`\
export function ${syntheticNamePrefix}focusSparqlWherePatterns({ filter, focusIdentifier, preferredLanguages, variablePrefix }: { filter: ${this.filterType} | undefined; focusIdentifier: ${imports.NamedNode} | ${imports.Variable}; ignoreRdfType: boolean; preferredLanguages: readonly string[] | undefined; variablePrefix: string }): readonly ${snippets.SparqlPattern}[] {
${joinCode([
  code`let patterns: ${snippets.SparqlPattern}[] = [];`,
  code`\
if (focusIdentifier.termType === "Variable") {
  patterns = patterns.concat(${this.#identifierType.valueSparqlWherePatternsFunction}({
      filter: filter?.${syntheticNamePrefix}identifier,
      ignoreRdfType: false,
      preferredLanguages,
      propertyPatterns: [],
      schema: ${this.#identifierType.schema},
      valueVariable: focusIdentifier,
      variablePrefix,
  }));
}`,
  code`patterns.push({ patterns: [${joinCode(
    this.concreteMembers.map(
      (member) =>
        code`${{
          patterns: code`${member.type.staticModuleName}.${syntheticNamePrefix}focusSparqlWherePatterns({ filter: filter?.on?.${member.type.name}, focusIdentifier, ignoreRdfType: false, preferredLanguages, variablePrefix: \`\${variablePrefix}${pascalCase(member.type.name)}\` }).concat()`,
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
    if (!this.features.has("rdf")) {
      return {};
    }

    return singleEntryRecord(
      `${syntheticNamePrefix}fromRdfResource`,
      code`\
export const ${syntheticNamePrefix}fromRdfResource: ${snippets.FromRdfResourceFunction}<${this.name}> = (resource, options) => 
  ${this.concreteMembers.reduce(
    (expression, member) => {
      const memberTypeExpression = code`(${member.type.staticModuleName}.${syntheticNamePrefix}fromRdfResource(resource, { ...options, ignoreRdfType: false }) as ${imports.Either}<Error, ${this.name}>)`;
      return expression !== null
        ? code`${expression}.altLazy(() => ${memberTypeExpression})`
        : memberTypeExpression;
    },
    null as Code | null,
  )};`,
    );
  }

  private get graphqlTypeVariableStatement(): Record<string, Code> {
    if (!this.features.has("graphql")) {
      return {};
    }

    return singleEntryRecord(
      `${syntheticNamePrefix}GraphQL`,
      code`\
export const ${syntheticNamePrefix}GraphQL = new ${imports.GraphQLUnionType}(${{
        description: this.comment.map(JSON.stringify).extract(),
        name: this.name,
        resolveType: code`(value: ${this.name}) => value.${syntheticNamePrefix}type`,
        types: code`[${joinCode(
          this.concreteMembers.map(
            (member) => member.type.graphqlType.nullableName,
          ),
          { on: ", " },
        )}]`,
      }});`,
    );
  }

  private get identifierTypeDeclarations(): Record<string, Code> {
    return singleEntryRecord(
      `${syntheticNamePrefix}Identifier`,
      code`\
export type ${syntheticNamePrefix}Identifier = ${this.#identifierType.name};
export namespace ${syntheticNamePrefix}Identifier { ${joinCode([this.#identifierType.fromStringFunction, this.#identifierType.toStringFunction])} }`,
    );
  }

  private get isTypeFunctionDeclaration(): Record<string, Code> {
    if (this._name === `${syntheticNamePrefix}Object`) {
      return {};
    }

    return singleEntryRecord(
      `is${this._name}`,
      code`\
    export function is${this._name}(object: ${syntheticNamePrefix}Object): object is ${this.name} {
      return ${joinCode(
        this.concreteMembers.map(
          (member) =>
            code`${member.type.staticModuleName}.is${member.type.name}(object)`,
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
        property: ObjectType.ShaclProperty<Type>;
      }
    > = {};

    this.concreteMembers.forEach((member, memberI) => {
      for (const memberTypeProperty of member.type.ownProperties.concat(
        member.type.ancestorObjectTypes.flatMap(
          (ancestorObjectType) => ancestorObjectType.ownProperties,
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
              this.concreteMembers.length,
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
      `${syntheticNamePrefix}schema`,
      code`\
export const ${syntheticNamePrefix}schema =
${{
  ...super.schemaObject,
  properties: code`{ ${joinCode(propertiesObject, { on: ", " })} }`,
}} as const;`,
    );
  }

  private get toRdfResourceFunctionDeclaration(): Record<string, Code> {
    if (!this.features.has("rdf")) {
      return {};
    }

    return singleEntryRecord(
      `${syntheticNamePrefix}toRdfResource`,
      code`\
export const ${syntheticNamePrefix}toRdfResource: ${snippets.ToRdfResourceFunction}<${this.name}> = (value, options) => {
${joinCode(
  this.concreteMembers
    .map((member) => {
      let returnExpression: Code;
      switch (member.type.declarationType) {
        case "class":
          returnExpression = code`value.${syntheticNamePrefix}toRdfResource(options)`;
          break;
        case "interface":
          returnExpression = code`${member.type.staticModuleName}.${syntheticNamePrefix}toRdfResource(value, options)`;
          break;
      }
      return code`if (${member.type.staticModuleName}.is${member.type.name}(value)) { return ${returnExpression}; }`;
    })
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
