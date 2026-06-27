import { Memoize } from "typescript-memoize";
import { ObjectDiscriminatedUnionType_focusSparqlConstructTriplesFunctionDeclaration } from "./_ObjectDiscriminatedUnionType/ObjectDiscriminatedUnionType_focusSparqlConstructTriplesFunctionDeclaration.js";
import { ObjectDiscriminatedUnionType_focusSparqlWherePatternsFunctionDeclaration } from "./_ObjectDiscriminatedUnionType/ObjectDiscriminatedUnionType_focusSparqlWherePatternsFunctionDeclaration.js";
import { ObjectDiscriminatedUnionType_fromRdfResourceFunctionDeclaration } from "./_ObjectDiscriminatedUnionType/ObjectDiscriminatedUnionType_fromRdfResourceFunctionDeclaration.js";
import { ObjectDiscriminatedUnionType_graphqlTypeVariableStatement } from "./_ObjectDiscriminatedUnionType/ObjectDiscriminatedUnionType_graphqlTypeVariableStatement.js";
import { ObjectDiscriminatedUnionType_identifierTypeDeclarations } from "./_ObjectDiscriminatedUnionType/ObjectDiscriminatedUnionType_identifierTypeDeclarations.js";
import { ObjectDiscriminatedUnionType_isTypeFunctionDeclaration } from "./_ObjectDiscriminatedUnionType/ObjectDiscriminatedUnionType_isTypeFunctionDeclaration.js";
import { ObjectDiscriminatedUnionType_schemaVariableStatement } from "./_ObjectDiscriminatedUnionType/ObjectDiscriminatedUnionType_schemaVariableStatement.js";
import { ObjectDiscriminatedUnionType_toRdfResourceFunctionDeclaration } from "./_ObjectDiscriminatedUnionType/ObjectDiscriminatedUnionType_toRdfResourceFunctionDeclaration.js";
import { ObjectType_objectSetMethodNames } from "./_ObjectType/ObjectType_objectSetMethodNames.js";
import { ObjectType_sparqlConstructQueryFunctionDeclaration } from "./_ObjectType/ObjectType_sparqlConstructQueryFunctionDeclaration.js";
import { ObjectType_sparqlConstructQueryStringFunctionDeclaration } from "./_ObjectType/ObjectType_sparqlConstructQueryStringFunctionDeclaration.js";
import { DiscriminatedUnionType } from "./DiscriminatedUnionType.js";
import type { ObjectType } from "./ObjectType.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class ObjectDiscriminatedUnionType extends DiscriminatedUnionType<ObjectType> {
  override readonly kind = "ObjectDiscriminatedUnion";

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
      ...ObjectDiscriminatedUnionType_identifierTypeDeclarations.call(this),
      ...ObjectDiscriminatedUnionType_focusSparqlConstructTriplesFunctionDeclaration.call(
        this,
      ),
      ...ObjectDiscriminatedUnionType_focusSparqlWherePatternsFunctionDeclaration.call(
        this,
      ),
      ...ObjectDiscriminatedUnionType_fromRdfResourceFunctionDeclaration.call(
        this,
      ),
      ...ObjectDiscriminatedUnionType_graphqlTypeVariableStatement.call(this),
      ...ObjectDiscriminatedUnionType_isTypeFunctionDeclaration.call(this),
      ...ObjectDiscriminatedUnionType_schemaVariableStatement.call(this),
      ...(this.configuration.features.has("Object.SPARQL")
        ? {
            ...singleEntryRecord(
              "sparqlConstructQuery",
              ObjectType_sparqlConstructQueryFunctionDeclaration.call({
                name,
                configuration: this.configuration,
                filterType: this.filterType,
                reusables: this.reusables,
              }),
            ),
            ...singleEntryRecord(
              "sparqlConstructQueryString",
              ObjectType_sparqlConstructQueryStringFunctionDeclaration.call({
                name,
                configuration: this.configuration,
                filterType: this.filterType,
                reusables: this.reusables,
              }),
            ),
          }
        : {}),
      ...ObjectDiscriminatedUnionType_toRdfResourceFunctionDeclaration,
    };
  }
}
