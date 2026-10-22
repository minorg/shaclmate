import { Memoize } from "typescript-memoize";
import { AbstractIntersectionType } from "./AbstractIntersectionType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";
import type { ObjectType } from "./ObjectType.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

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
          memberTypeExpression = code`Omit<${memberTypeExpression}, ${discriminantProperty.name}>`;
        });
        return memberTypeExpression;
      }),
      { on: "&" },
    );
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

  // protected override staticModuleDeclarations(
  //   name: string,
  // ): Record<string, Code> {
  //   return {
  //     ...super.staticModuleDeclarations(name),
  //     ...ObjectIntersectionType_identifierTypeDeclarations.call(this),
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
  //   };
  // }
}
