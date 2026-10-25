import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { ObjectIntersectionType_createFunction } from "./_ObjectIntersectionType/ObjectIntersectionType_createFunction.js";
import { ObjectIntersectionType_createFunctionParameters } from "./_ObjectIntersectionType/ObjectIntersectionType_createFunctionParameters.js";
import { ObjectIntersectionType_fromJsonFunctionExpression } from "./_ObjectIntersectionType/ObjectIntersectionType_fromJsonFunction.js";
import { ObjectIntersectionType_fromRdfResourceValuesFunctionExpression } from "./_ObjectIntersectionType/ObjectIntersectionType_fromRdfResourceValuesFunction.js";
import { ObjectIntersectionType_jsonType } from "./_ObjectIntersectionType/ObjectIntersectionType_jsonType.js";
import { ObjectIntersectionType_toJsonFunctionExpression } from "./_ObjectIntersectionType/ObjectIntersectionType_toJsonFunction.js";
import { ObjectType_identifierTypeDeclarations } from "./_ObjectType/ObjectType_identifierTypeDeclarations.js";
import { AbstractIntersectionType } from "./AbstractIntersectionType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { Callable } from "./Callable.js";
import { DeclaredCallable } from "./DeclaredCallable.js";
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
  get createFunctionParameters(): ObjectType.CreateFunctionParameters {
    return ObjectIntersectionType_createFunctionParameters.call(this);
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
      { on: " & " },
    );
  }

  @Memoize()
  override jsonType(): AbstractIntersectionType.JsonType {
    return ObjectIntersectionType_jsonType.call(this);
  }

  @Memoize()
  protected get createFunction(): Callable {
    return ObjectIntersectionType_createFunction.call(this);
  }

  // @Memoize()
  // protected get createUnsafeFunction(): Callable {
  //   return ObjectIntersectionType_createUnsafeFunction.call(this);
  // }

  protected override staticModuleDeclarations(
    name: string,
  ): Record<string, Code> {
    const staticModuleDeclarations: Record<string, Code> = {
      ...super.staticModuleDeclarations(name),
      ...ObjectType_identifierTypeDeclarations.call(this),
    };

    function addFunctionDeclaration(function_: Callable) {
      invariant(function_ instanceof DeclaredCallable);
      staticModuleDeclarations[function_.unqualifiedName] =
        code`export ${function_.declaration}`;
    }

    if (this.configuration.features.has("Object.create")) {
      staticModuleDeclarations["CreateParameters"] =
        code`export type CreateParameters<${this.configuration.syntheticNamePrefix}DefaultNamespaceT extends ${this.reusables.snippets.NamespaceBuilder} = ${this.reusables.snippets.NamespaceBuilder}> = ${this.createFunctionParameters.type.inlineExpression};`;
      addFunctionDeclaration(this.createFunction);
      // addFunctionDeclaration(this.createUnsafeFunction);
    }

    return staticModuleDeclarations;
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
  }
}
