import { Maybe } from "purify-ts";
import { PropertyPath } from "rdfjs-resource";
import { Memoize } from "typescript-memoize";
import { ObjectType_objectSetMethodNames } from "./_ObjectType/ObjectType_objectSetMethodNames.js";
import { AbstractNamedUnionType } from "./AbstractNamedUnionType.js";
import { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";
import { imports } from "./imports.js";
import type { ObjectType } from "./ObjectType.js";
import { snippets } from "./snippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { Type } from "./Type.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class NamedObjectUnionType extends AbstractNamedUnionType<ObjectType> {
  private readonly identifierType: BlankNodeType | IdentifierType | IriType;

  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly kind = "NamedObjectUnionType";

  constructor({
    identifierType,
    ...superParameters
  }: {
    identifierType: BlankNodeType | IdentifierType | IriType;
  } & ConstructorParameters<typeof AbstractNamedUnionType<ObjectType>>[0]) {
    super(superParameters);
    this.identifierType = identifierType;
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

  protected override get staticModuleDeclarations(): readonly Code[] {
    let staticModuleDeclarations = super.staticModuleDeclarations.concat();

    if (this.features.has("graphql")) {
      staticModuleDeclarations.push(code`\
export const ${syntheticNamePrefix}GraphQL = new ${imports.GraphQLUnionType}(${{
        description: this.comment.map(JSON.stringify).extract(),
        name: this.name,
        resolveType: code`(value: ${this.name}) => value.${syntheticNamePrefix}type`,
        types: code`[${joinCode(
          this.memberTypes
            .filter((memberType) => !memberType.abstract)
            .map((memberType) => memberType.graphqlType.nullableName),
          { on: ", " },
        )}]`,
      }});
`);
    }

    staticModuleDeclarations = staticModuleDeclarations.concat(
      code`export type ${syntheticNamePrefix}Identifier = ${this.identifierType.name};`,
      code`export namespace ${syntheticNamePrefix}Identifier { ${joinCode([this.identifierType.fromStringFunction, this.identifierType.toStringFunction])} }`,
    );

    if (this.features.has("rdf")) {
      staticModuleDeclarations = staticModuleDeclarations.concat(
        code`\
export const ${syntheticNamePrefix}fromRdfResource: ${snippets.FromRdfResourceFunction}<${this.name}> = (resource, options) => 
  ${this.concreteMemberTypeDescriptors.reduce(
    (expression, { memberType }) => {
      const memberTypeExpression = code`(${memberType.staticModuleName}.${syntheticNamePrefix}fromRdfResource(resource, { ...options, ignoreRdfType: false }) as ${imports.Either}<Error, ${this.name}>)`;
      return expression !== null
        ? code`${expression}.altLazy(() => ${memberTypeExpression})`
        : memberTypeExpression;
    },
    null as Code | null,
  )};`,

        code`\
export const ${syntheticNamePrefix}toRdfResource: ${snippets.ToRdfResourceFunction}<${this.name}> = (value, options) => {
${joinCode(
  this.concreteMemberTypeDescriptors
    .map(({ memberType }) => {
      let returnExpression: Code;
      switch (memberType.declarationType) {
        case "class":
          returnExpression = code`value.${syntheticNamePrefix}toRdfResource(options)`;
          break;
        case "interface":
          returnExpression = code`${memberType.staticModuleName}.${syntheticNamePrefix}toRdfResource(value, options)`;
          break;
      }
      return code`if (${memberType.staticModuleName}.is${memberType.name}(value)) { return ${returnExpression}; }`;
    })
    .concat(code`throw new Error("unrecognized type");`),
)}
}`,
      );
    }

    if (this._name !== `${syntheticNamePrefix}Object`) {
      staticModuleDeclarations.push(code`\
    export function is${this._name}(object: ${syntheticNamePrefix}Object): object is ${this.name} {
      return ${joinCode(
        this.memberTypes.map(
          (memberType) =>
            code`${memberType.staticModuleName}.is${memberType.name}(object)`,
        ),
        { on: " || " },
      )};
    }`);
    }

    staticModuleDeclarations.push(this.schemaVariableStatement);

    return staticModuleDeclarations;
  }

  private get schemaVariableStatement(): Code {
    const commonPropertiesByName: Record<
      string,
      {
        memberTypesWithProperty: boolean[];
        property: ObjectType.ShaclProperty<Type>;
      }
    > = {};

    this.memberTypes.forEach((memberType, memberTypeI) => {
      for (const memberTypeProperty of memberType.ownProperties.concat(
        memberType.ancestorObjectTypes.flatMap(
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
            commonProperty.memberTypesWithProperty[memberTypeI] = true;
          }
        } else {
          commonPropertiesByName[memberTypeProperty.name] = commonProperty = {
            memberTypesWithProperty: new Array<boolean>(
              this.memberTypes.length,
            ).fill(false),
            property: memberTypeProperty,
          };
          commonProperty.memberTypesWithProperty[memberTypeI] = true;
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

    return code`\
export const ${syntheticNamePrefix}schema =
${{
  ...super.schemaObject,
  properties: code`{ ${joinCode(propertiesObject, { on: "; " })} }`,
}} as const;`;
  }

  override graphqlResolveExpression({
    variables,
  }: {
    variables: { value: Code };
  }): Code {
    return variables.value;
  }
}
