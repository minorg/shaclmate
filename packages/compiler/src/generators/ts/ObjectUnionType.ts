import { PropertyPath } from "@rdfx/resource";

import { pascalCase } from "change-case";
import { Memoize } from "typescript-memoize";
import { ObjectType_objectSetMethodNames } from "./_ObjectType/ObjectType_objectSetMethodNames.js";
import { ObjectType_sparqlConstructQueryFunctionDeclaration } from "./_ObjectType/ObjectType_sparqlConstructQueryFunctionDeclaration.js";
import { ObjectType_sparqlConstructQueryStringFunctionDeclaration } from "./_ObjectType/ObjectType_sparqlConstructQueryStringFunctionDeclaration.js";
import type { ObjectType } from "./ObjectType.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import type { Type } from "./Type.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";
import { UnionType } from "./UnionType.js";

export class ObjectUnionType extends UnionType<ObjectType> {
  override readonly kind = "ObjectUnion";

  @Memoize()
  get identifierTypeAlias(): Code {
    return this.name.map((name) => code`${name}.Identifier`).unsafeCoerce();
  }

  @Memoize()
  get objectSetMethodNames(): ObjectType.ObjectSetMethodNames {
    return this.name
      .map((name) =>
        ObjectType_objectSetMethodNames.call({
          name,
          configuration: this.configuration,
        }),
      )
      .unsafeCoerce();
  }

  @Memoize()
  override get schema(): Code {
    return this.name
      .map((name) => code`${name}.schema`)
      .orDefault(super.schema);
  }

  @Memoize()
  override get schemaType(): Code {
    return this.name
      .map(() => code`typeof ${this.schema}`)
      .orDefault(super.schemaType);
  }

  protected override get staticModuleDeclarations(): Record<string, Code> {
    const name = this.name.unsafeCoerce();
    return {
      ...super.staticModuleDeclarations,
      ...this.identifierTypeDeclarations,
      ...this.focusSparqlConstructTriplesFunctionDeclaration,
      ...this.focusSparqlWherePatternsFunctionDeclaration,
      ...this.fromRdfResourceFunctionDeclaration,
      ...this.graphqlTypeVariableStatement,
      ...this.isTypeFunctionDeclaration,
      ...this.schemaVariableStatement,
      ...ObjectType_sparqlConstructQueryFunctionDeclaration.call({
        name,
        configuration: this.configuration,
        filterType: this.filterType,
        reusables: this.reusables,
      })
        .map((code_) => singleEntryRecord(`sparqlConstructQuery`, code_))
        .orDefault({}),
      ...ObjectType_sparqlConstructQueryStringFunctionDeclaration.call({
        name,
        configuration: this.configuration,
        filterType: this.filterType,
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
    if (!this.configuration.features.has("Object.SPARQL")) {
      return {};
    }

    return singleEntryRecord(
      `focusSparqlConstructTriples`,
      code`\
export function focusSparqlConstructTriples({ filter, focusIdentifier, variablePrefix }: { filter: ${this.filterType} | undefined; focusIdentifier: ${this.reusables.imports.NamedNode} | ${this.reusables.imports.Variable}; ignoreRdfType: boolean; variablePrefix: string }): readonly ${this.reusables.imports.sparqljs}.Triple[] {
  return [${joinCode(
    this.members.map(
      (member) =>
        code`...${member.type.name.unsafeCoerce()}.focusSparqlConstructTriples({ filter: filter?.on?.${member.type.name.unsafeCoerce()}, focusIdentifier, ignoreRdfType: false, variablePrefix: \`\${variablePrefix}${pascalCase(member.type.name.unsafeCoerce())}\` }).concat()`,
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
    if (!this.configuration.features.has("Object.SPARQL")) {
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
  patterns = patterns.concat(${this.identifierType.unsafeCoerce().valueSparqlWherePatternsFunction}({
      filter: filter?.${this.configuration.syntheticNamePrefix}identifier,
      ignoreRdfType: false,
      preferredLanguages,
      propertyPatterns: [],
      schema: ${this.identifierType.unsafeCoerce().schema},
      valueVariable: focusIdentifier,
      variablePrefix,
  }));
}`,
  code`patterns.push({ patterns: [${joinCode(
    this.members.map(
      (member) =>
        code`${{
          patterns: code`${member.type.name.unsafeCoerce()}.focusSparqlWherePatterns({ filter: filter?.on?.${member.type.name.unsafeCoerce()}, focusIdentifier, ignoreRdfType: false, preferredLanguages, variablePrefix: \`\${variablePrefix}${pascalCase(member.type.name.unsafeCoerce())}\` }).concat()`,
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
    if (!this.configuration.features.has("Object.fromRdf")) {
      return {};
    }

    const name = this.name.unsafeCoerce();

    return singleEntryRecord(
      `fromRdfResource`,
      code`\
export const fromRdfResource: ${this.reusables.snippets.FromRdfResourceFunction}<${name}> = (resource, options) => 
  ${this.members.reduce(
    (expression, member) => {
      const memberTypeExpression = code`(${member.type.name.unsafeCoerce()}.fromRdfResource(resource, { ...options, ignoreRdfType: false }) as ${this.reusables.imports.Either}<Error, ${name}>)`;
      return expression !== null
        ? code`${expression}.altLazy(() => ${memberTypeExpression})`
        : memberTypeExpression;
    },
    null as Code | null,
  )};`,
    );
  }

  private get graphqlTypeVariableStatement(): Record<string, Code> {
    if (!this.configuration.features.has("GraphQL")) {
      return {};
    }

    if (this.synthetic) {
      return {};
    }

    const name = this.name.unsafeCoerce();

    return singleEntryRecord(
      `GraphQL`,
      code`\
export const GraphQL = new ${this.reusables.imports.GraphQLUnionType}(${{
        description: this.comment.map(JSON.stringify).extract(),
        name: name,
        resolveType: code`(value: ${name}) => value.${this.configuration.syntheticNamePrefix}type`,
        types: code`[${joinCode(
          this.members.map(
            (member) => member.type.graphqlType.nullableExpression,
          ),
          { on: ", " },
        )}]`,
      }});`,
    );
  }

  private get identifierTypeDeclarations(): Record<string, Code> {
    if (!this.configuration.features.has("Object.type")) {
      return {};
    }

    return singleEntryRecord(
      `Identifier`,
      code`\
export type Identifier = ${this.identifierType.unsafeCoerce().expression};
export namespace Identifier {
  export const parse = ${this.identifierType.unsafeCoerce().parseFunction};
  export const stringify = ${this.identifierType.unsafeCoerce().stringifyFunction};
}`,
    );
  }

  private get isTypeFunctionDeclaration(): Record<string, Code> {
    if (!this.configuration.features.has("Object.type")) {
      return {};
    }

    const name = this.name.unsafeCoerce();

    if (name === `${this.configuration.syntheticNamePrefix}Object`) {
      return {};
    }

    return singleEntryRecord(
      `is${name}`,
      code`\
    export function is${name}(object: ${this.configuration.syntheticNamePrefix}Object): object is ${name} {
      return ${joinCode(
        this.members.map(
          (member) =>
            code`${member.type.name.unsafeCoerce()}.is${member.type.name.unsafeCoerce()}(object)`,
        ),
        { on: " || " },
      )};
    }`,
    );
  }

  private get schemaVariableStatement(): Record<string, Code> {
    if (!this.configuration.features.has("Object.schema")) {
      return {};
    }

    const commonPropertiesByName: Record<
      string,
      {
        memberTypesWithProperty: boolean[];
        property: ObjectType.ShaclProperty<Type>;
      }
    > = {};

    this.members.forEach((member, memberI) => {
      for (const memberTypeProperty of member.type.properties) {
        if (memberTypeProperty.kind !== "Shacl") {
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
      property.schema.ifJust((propertySchema) => {
        propertiesObject.push(code`${property.name}: ${propertySchema}`);
      });
    }

    return singleEntryRecord(
      `schema`,
      code`\
export const schema = { ${joinCode(super.schemaInitializers.concat(code`properties: { ${joinCode(propertiesObject, { on: ", " })} }`), { on: ", " })} } as const;`,
    );
  }

  private get toRdfResourceFunctionDeclaration(): Record<string, Code> {
    if (!this.configuration.features.has("Object.toRdf")) {
      return {};
    }

    const name = this.name.unsafeCoerce();

    return singleEntryRecord(
      `toRdfResource`,
      code`\
export const toRdfResource: ${this.reusables.snippets.ToRdfResourceFunction}<${name}> = (object, options) => {
${joinCode(
  this.members
    .map(
      (member) =>
        code`if (${member.type.name.unsafeCoerce()}.is${member.type.name.unsafeCoerce()}(object)) { return ${member.type.name.unsafeCoerce()}.toRdfResource(object, options); }`,
    )
    .concat(code`throw new Error("unrecognized type");`),
)}
};`,
    );
  }
}
