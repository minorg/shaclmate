import type { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { ObjectDiscriminatedUnionType_focusSparqlConstructTriplesFunction } from "./_ObjectDiscriminatedUnionType/ObjectDiscriminatedUnionType_focusSparqlConstructTriplesFunction.js";
import { ObjectDiscriminatedUnionType_focusSparqlWherePatternsFunction } from "./_ObjectDiscriminatedUnionType/ObjectDiscriminatedUnionType_focusSparqlWherePatternsFunction.js";
import { ObjectDiscriminatedUnionType_fromRdfResourceFunction } from "./_ObjectDiscriminatedUnionType/ObjectDiscriminatedUnionType_fromRdfResourceFunction.js";
import { ObjectDiscriminatedUnionType_graphqlTypeExpression } from "./_ObjectDiscriminatedUnionType/ObjectDiscriminatedUnionType_graphqlTypeExpression.js";
import { ObjectDiscriminatedUnionType_schemaExpression } from "./_ObjectDiscriminatedUnionType/ObjectDiscriminatedUnionType_schemaExpression.js";
import { ObjectDiscriminatedUnionType_toRdfResourceFunction } from "./_ObjectDiscriminatedUnionType/ObjectDiscriminatedUnionType_toRdfResourceFunction.js";
import { ObjectDiscriminatedUnionType_typeGuardFunction } from "./_ObjectDiscriminatedUnionType/ObjectDiscriminatedUnionType_typeGuardFunction.js";
import { ObjectType_identifierTypeDeclarations } from "./_ObjectType/ObjectType_identifierTypeDeclarations.js";
import { ObjectType_objectSetMethodNames } from "./_ObjectType/ObjectType_objectSetMethodNames.js";
import { ObjectType_sparqlConstructQueryFunction } from "./_ObjectType/ObjectType_sparqlConstructQueryFunction.js";
import { ObjectType_sparqlConstructQueryStringFunction } from "./_ObjectType/ObjectType_sparqlConstructQueryStringFunction.js";
import { AbstractDiscriminatedUnionType } from "./AbstractDiscriminatedUnionType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { Callable } from "./Callable.js";
import { DeclaredCallable } from "./DeclaredCallable.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";
import type { ObjectType } from "./ObjectType.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class ObjectDiscriminatedUnionType extends AbstractDiscriminatedUnionType<ObjectType> {
  protected override schemaExpression =
    ObjectDiscriminatedUnionType_schemaExpression;

  readonly identifierType: BlankNodeType | IdentifierType | IriType;
  override readonly kind = "ObjectDiscriminatedUnion";

  constructor({
    identifierType,
    ...superParameters
  }: {
    identifierType: BlankNodeType | IdentifierType | IriType;
  } & ConstructorParameters<
    typeof AbstractDiscriminatedUnionType<ObjectType>
  >[0]) {
    super(superParameters);
    this.identifierType = identifierType;
  }

  @Memoize()
  get focusSparqlConstructTriplesFunction(): Callable {
    return ObjectDiscriminatedUnionType_focusSparqlConstructTriplesFunction.call(
      this,
    );
  }

  @Memoize()
  get focusSparqlWherePatternsFunction(): Callable {
    return ObjectDiscriminatedUnionType_focusSparqlWherePatternsFunction.call(
      this,
    );
  }

  @Memoize()
  get fromRdfResourceFunction(): Callable {
    return ObjectDiscriminatedUnionType_fromRdfResourceFunction.call(this);
  }

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
  get sparqlConstructQueryFunction(): Callable {
    return ObjectType_sparqlConstructQueryFunction.call({
      configuration: this.configuration,
      filterType: this.filterType,
      _function: this._function.bind(this),
      focusSparqlConstructTriplesFunction:
        this.focusSparqlConstructTriplesFunction,
      focusSparqlWherePatternsFunction: this.focusSparqlWherePatternsFunction,
      name: this.name,
      reusables: this.reusables,
    });
  }

  @Memoize()
  get sparqlConstructQueryStringFunction(): Callable {
    return ObjectType_sparqlConstructQueryStringFunction.call({
      configuration: this.configuration,
      filterType: this.filterType,
      _function: this._function.bind(this),
      sparqlConstructQueryFunction: this.sparqlConstructQueryFunction,
      reusables: this.reusables,
    });
  }

  @Memoize()
  get toRdfResourceFunction(): Callable {
    return ObjectDiscriminatedUnionType_toRdfResourceFunction.call(this);
  }

  @Memoize()
  get typeGuardFunction(): Maybe<Callable> {
    return ObjectDiscriminatedUnionType_typeGuardFunction.call(this);
  }

  @Memoize()
  protected override get inlineExpression() {
    if (this.discriminant.kind === "Intrinsic") {
      return code`(${joinCode(
        this.members.map(({ type }) => type.discriminatedExpression),
        { on: " | " },
      )})`;
    }
    return super.inlineExpression;
  }

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

    if (this.configuration.features.has("Object.fromRdf")) {
      addFunctionDeclaration(this.fromRdfResourceFunction);
    }

    if (this.configuration.features.has("GraphQL")) {
      staticModuleDeclarations["GraphQL"] =
        code`export const GraphQL = ${ObjectDiscriminatedUnionType_graphqlTypeExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.SPARQL")) {
      addFunctionDeclaration(this.focusSparqlConstructTriplesFunction);
      addFunctionDeclaration(this.focusSparqlWherePatternsFunction);
      addFunctionDeclaration(this.sparqlConstructQueryFunction);
      addFunctionDeclaration(this.sparqlConstructQueryStringFunction);
    }

    if (this.configuration.features.has("Object.toRdf")) {
      addFunctionDeclaration(this.toRdfResourceFunction);
    }

    if (this.configuration.features.has("Object.type")) {
      ObjectDiscriminatedUnionType_typeGuardFunction.call(this).ifJust(
        addFunctionDeclaration,
      );
    }

    return staticModuleDeclarations;
  }
}
