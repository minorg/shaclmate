import { Memoize } from "typescript-memoize";
import { ObjectIntersectionType_fromJsonFunctionExpression } from "./_ObjectIntersectionType/ObjectIntersectionType_fromJsonFunction.js";
import { ObjectIntersectionType_fromRdfResourceValuesFunctionExpression } from "./_ObjectIntersectionType/ObjectIntersectionType_fromRdfResourceValuesFunction.js";
import { ObjectIntersectionType_jsonType } from "./_ObjectIntersectionType/ObjectIntersectionType_jsonType.js";
import { ObjectIntersectionType_toJsonFunctionExpression } from "./_ObjectIntersectionType/ObjectIntersectionType_toJsonFunction.js";
import { ObjectType_identifierTypeDeclarations } from "./_ObjectType/ObjectType_identifierTypeDeclarations.js";
import { AbstractIntersectionType } from "./AbstractIntersectionType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";
import type { ObjectType } from "./ObjectType.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";

export class ObjectIntersectionType extends AbstractIntersectionType<ObjectType> {
  protected override fromJsonFunctionExpression =
    ObjectIntersectionType_fromJsonFunctionExpression;
  protected override fromRdfResourceValuesFunctionExpression =
    ObjectIntersectionType_fromRdfResourceValuesFunctionExpression;
  protected override toJsonFunctionExpression =
    ObjectIntersectionType_toJsonFunctionExpression;

  readonly identifierType: BlankNodeType | IdentifierType | IriType;
  override readonly kind = "ObjectIntersection";

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
  get identifierTypeAlias(): Code {
    return this.name.map((name) => code`${name}.Identifier`).unsafeCoerce();
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

  @Memoize()
  override jsonType(): AbstractIntersectionType.JsonType {
    return ObjectIntersectionType_jsonType.call(this);
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
