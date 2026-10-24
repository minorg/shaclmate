import { Memoize } from "typescript-memoize";
import { ObjectType_identifierTypeDeclarations } from "./_ObjectType/ObjectType_identifierTypeDeclarations.js";
import { AbstractIntersectionType } from "./AbstractIntersectionType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";
import type { ObjectType } from "./ObjectType.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";

export class ObjectIntersectionType extends AbstractIntersectionType<ObjectType> {
  override readonly kind = "ObjectIntersection";
  readonly identifierType: BlankNodeType | IdentifierType | IriType;

  constructor({
    identifierType,
    ...superParameters
  }: {
    identifierType: BlankNodeType | IdentifierType | IriType;
  } & ConstructorParameters<typeof AbstractIntersectionType<ObjectType>>[0]) {
    super(superParameters);
    this.identifierType = identifierType;
  }

  @Memoize()
  protected override get inlineExpression(): Code {
    return joinCode(
      this.members.map((member) => {
        let memberTypeExpression = member.type.expression;
        member.type.discriminantProperty.ifJust((discriminantProperty) => {
          memberTypeExpression = code`Omit<${memberTypeExpression}, ${literalOf(discriminantProperty.name)}>`;
        });
        return memberTypeExpression;
      }),
      { on: "&" },
    );
  }

  protected fromJsonFunctionExpression(): Code {
    return code`\
(value) =>
    ${joinCode(
      this.members.map(
        (member, memberI) => code`
${member.type.fromJsonExpression({
  form: "compact",
  variables: {
    value: code`value`,
  },
})}.${memberI + 1 < this.members.length ? "chain" : "map"}(member${memberI} =>`,
      ),
    )} ({ ${joinCode(
      this.members.map((_, memberI) => code`...member${memberI}`),
      { on: "," },
    )} }) ${")".repeat(this.members.length)}`;
  }

  protected fromRdfResourceValuesFunctionExpression(): Code {
    return code`\
(inputValues, options) =>
    ${joinCode(
      this.members.map(
        (member, memberI) => code`\
      ${member.type.fromRdfResourceValuesFunction.annotatedUsage}(inputValues, { ...options, ignoreRdfType: true, schema: options.schema.members[${literalOf(memberI)}] }).chain(member${memberI}Values =>`,
      ),
    )} {
      ${joinCode(
        this.members.map(
          (member, memberI) =>
            code`\
const member${memberI}ValuesArray = member${memberI}Values.toArray(); ${
              memberI > 0
                ? code`
if (member${memberI}ValuesArray.length !== member0Values.length) {
  return ${this.reusables.imports.Left}(new Error(\`${this.name.orDefault("(anonymous intersection)")} member ${memberI} (${member.type.name.orDefault("(anonymous object)")}) has \${member${memberI}Values.length} values, expected \${member0Values.length}\`));
}`
                : code``
            }`,
        ),
      )}

      return ${this.reusables.imports.Right}(member0Values.map((_, valueI) => ({ ${joinCode(
        this.members.map(
          (_, memberI) => code`...member${memberI}ValuesArray[valueI]`,
        ),
        { on: "," },
      )} })));
    } ${")".repeat(this.members.length)}`;
  }

  @Memoize()
  override jsonType(): AbstractIntersectionType.JsonType {
    return this.jsonTypeFactory.createJsonIntersectionType(
      this.members.map((member) => member.type.jsonType({ form: "compact" })),
      {
        memberTypeExpression: (memberType) =>
          code`Omit<${memberType.expression}, ${literalOf(this.configuration.objectDiscriminantProperty.jsonName)}>`,
        memberTypeSchema: (memberType) =>
          code`${memberType.schema}.omit({ ${this.configuration.objectDiscriminantProperty.jsonName}: true })`,
        name: this.name.map((name) => [name, "Json"]).extract(),
        recursive: this.recursive,
      },
    );
  }

  protected toJsonFunctionExpression(): Code {
    return code`\
(value) => ({
${joinCode(
  this.members.map(
    ({ type }) =>
      code`...${type.toJsonExpression({
        form: "compact",
        variables: { value: code`value` },
      })}`,
  ),
  { on: "," },
)}})`;
  }

  @Memoize()
  get identifierTypeAlias(): Code {
    return this.name.map((name) => code`${name}.Identifier`).unsafeCoerce();
  }

  // @Memoize()
  // get objectSetMethodNames(): ObjectType.ObjectSetMethodNames {
  //   return this.name
  //     .map((name) =>
  //       ObjectType_objectSetMethodNames.call({
  //         name,
  //         configuration: this.configuration,
  //       }),
  //     )
  //     .unsafeCoerce();
  // }

  // @Memoize()
  // get typeGuardFunction(): Maybe<Code> {
  //   if (
  //     Object.keys(
  //       ObjectIntersectionType_typeGuardFunctionDeclaration.call(this),
  //     ).length === 0
  //   ) {
  //     return Maybe.empty();
  //   }
  //   return this.name.map((name) => code`${name}.is${name}`);
  // }

  protected override staticModuleDeclarations(
    name: string,
  ): Record<string, Code> {
    return {
      ...super.staticModuleDeclarations(name),
      ...ObjectType_identifierTypeDeclarations.call(this),
      //     ...ObjectIntersectionType_focusSparqlConstructTriplesFunctionDeclaration.call(
      //       this,
      //     ),
      //     ...ObjectIntersectionType_focusSparqlWherePatternsFunctionDeclaration.call(
      //       this,
      //     ),
      //     ...ObjectIntersectionType_fromRdfResourceFunctionDeclaration.call(this),
      //     ...ObjectIntersectionType_graphqlTypeVariableStatement.call(this),
      //     ...ObjectIntersectionType_typeGuardFunctionDeclaration.call(this),
      //     ...ObjectIntersectionType_schemaVariableStatement.call(this),
      //     ...(this.configuration.features.has("Object.SPARQL")
      //       ? {
      //           ...singleEntryRecord(
      //             "sparqlConstructQuery",
      //             ObjectType_sparqlConstructQueryFunctionDeclaration.call({
      //               name,
      //               configuration: this.configuration,
      //               filterType: this.filterType,
      //               reusables: this.reusables,
      //             }),
      //           ),
      //           ...singleEntryRecord(
      //             "sparqlConstructQueryString",
      //             ObjectType_sparqlConstructQueryStringFunctionDeclaration.call({
      //               name,
      //               configuration: this.configuration,
      //               filterType: this.filterType,
      //               reusables: this.reusables,
      //             }),
      //           ),
      //         }
      //       : {}),
      //     ...ObjectIntersectionType_toRdfResourceFunctionDeclaration.call(this),
    };
  }
}
