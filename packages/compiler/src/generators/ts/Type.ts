import type { BlankNode, Literal, NamedNode, Variable } from "@rdfjs/types";

import type { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";

import type { TsFeature } from "../../enums/index.js";
import type { Import } from "./Import.js";
import { rdfjsTermExpression } from "./_ObjectType/rdfjsTermExpression.js";
import { objectInitializer } from "./objectInitializer.js";

/**
 * Abstract base class for generating TypeScript expressions and statemenst in the TypeScript generator.
 *
 * Subclasses are used for both property types (c.f., property* methods) and node/object types.
 */
export abstract class Type {
  protected readonly dataFactoryVariable: string;

  /**
   * Expressions that convert a source type or types to this type. It should include the type itself.
   */
  abstract readonly conversions: readonly Type.Conversion[];

  /**
   * A property that discriminates sub-types of this type e.g., termType on RDF/JS terms.
   */
  abstract readonly discriminatorProperty: Maybe<Type.DiscriminatorProperty>;

  /**
   * A function (reference or declaration) that compares two property values of this type, returning a
   * $EqualsResult.
   */
  abstract readonly equalsFunction: string;

  /**
   * GraphQL-compatible version of the type.
   */
  abstract readonly graphqlName: string;

  /**
   * JSON-compatible version of the type in a nested type declaration.
   */
  abstract readonly jsonName: string;

  /**
   * Is a value of this type mutable?
   */
  abstract readonly mutable: boolean;

  /**
   * Name of the type.
   */
  abstract readonly name: string;

  /**
   * JavaScript typeof the type.
   */
  abstract readonly typeof: "boolean" | "object" | "number" | "string";

  constructor({
    dataFactoryVariable,
  }: {
    dataFactoryVariable: string;
  }) {
    this.dataFactoryVariable = dataFactoryVariable;
  }

  get jsonPropertySignature(): {
    readonly hasQuestionToken?: boolean;
    readonly name: string;
  } {
    return {
      name: this.jsonName,
    };
  }

  /**
   * An expression that converts this type's JSON type to a value of this type.
   */
  abstract fromJsonExpression(parameters: {
    variables: {
      value: string;
    };
  }): string;

  /**
   * An expression that converts a rdfjsResource.Resource.Values to an Either of value/values
   * of this type for a property.
   */
  abstract fromRdfExpression(parameters: {
    variables: {
      context: string;
      ignoreRdfType?: boolean;
      languageIn: string;
      predicate: string;
      resource: string;
      resourceValues: string;
    };
  }): string;

  /**
   * An expression that resolves a value of this type in the GraphQL server.
   */
  abstract graphqlResolveExpression(parameters: {
    variables: {
      value: string;
    };
  }): string;

  /**
   * Statements that use hasher.update to hash a property value of this type.
   */
  abstract hashStatements(parameters: {
    depth: number;
    variables: {
      hasher: string;
      value: string;
    };
  }): readonly string[];

  /**
   * Element object for a JSON Forms UI schema.
   */
  abstract jsonUiSchemaElement(parameters: {
    variables: { scopePrefix: string };
  }): Maybe<string>;

  /**
   * Zod schema for the JSON type of this type.
   */
  abstract jsonZodSchema(parameters: { variables: { zod: string } }): string;

  /**
   * Reusable function, type, and other declarations that are not particular to this type but that type-specific code
   * relies on. For example, the equals function/method of ObjectType has a custom return type that's the same across all
   * ObjectType's. Instead of re-declaring the return type anonymously on every equals function, declare a named type
   * as a snippet and reference it.
   *
   * The generator deduplicates snippet declarations across all types before adding them to the source.
   */
  abstract snippetDeclarations(parameters: {
    features: Set<TsFeature>;
    recursionStack: Type[];
  }): readonly string[];

  /**
   * An array of SPARQL.js CONSTRUCT template triples for a value of this type, as strings (so they can incorporate runtime calls).
   *
   * This method is called in two contexts:
   * (1) When an instance of the type is an "object" of a property.
   *     This method should return a BGP (variables.subject, variables.predicate, variables.object) and recursively call itself with the variables.object as a "subject" context.
   * (2) When an instance of the type is a "subject".
   *     For example, ListType calls this method to with the item variable as a subject in order to chain additional patterns on items. Term types with no additional patterns should return an empty array.
   */
  sparqlConstructTemplateTriples({
    allowIgnoreRdfType,
    context,
    variables,
  }:
    | {
        allowIgnoreRdfType: boolean;
        context: "object";
        variables: {
          object: string;
          predicate: string;
          subject: string;
          variablePrefix: string;
        };
      }
    | {
        allowIgnoreRdfType: boolean;
        context: "subject";
        variables: {
          subject: string;
          variablePrefix: string;
        };
      }): readonly string[] {
    switch (context) {
      case "object": {
        const objectPrefix = `${this.dataFactoryVariable}.variable!(`;
        const objectSuffix = ")";
        invariant(variables.object.startsWith(objectPrefix));
        invariant(variables.object.endsWith(objectSuffix));
        return [
          objectInitializer({
            object: variables.object,
            predicate: variables.predicate,
            subject: variables.subject,
          }),
        ].concat(
          this.sparqlConstructTemplateTriples({
            allowIgnoreRdfType,
            context: "subject",
            variables: {
              subject: variables.object,
              variablePrefix: variables.object.substring(
                objectPrefix.length,
                variables.object.length - objectSuffix.length,
              ),
            },
          }),
        );
      }
      case "subject":
        return [];
    }
  }

  /**
   * An array of SPARQL.js where patterns for a value of this type, as strings (so they can incorporate runtime calls).
   *
   * See note in sparqlConstructTemplateTriples re: how this method is used.
   */
  sparqlWherePatterns({
    allowIgnoreRdfType,
    context,
    variables,
  }:
    | {
        allowIgnoreRdfType: boolean;
        context: "object";
        variables: {
          object: string;
          predicate: string;
          subject: string;
          variablePrefix: string;
        };
      }
    | {
        allowIgnoreRdfType: boolean;
        context: "subject";
        variables: {
          subject: string;
          variablePrefix: string;
        };
      }): readonly string[] {
    switch (context) {
      case "object": {
        const objectPrefix = `${this.dataFactoryVariable}.variable!(`;
        const objectSuffix = ")";
        invariant(variables.object.startsWith(objectPrefix));
        invariant(variables.object.endsWith(objectSuffix));
        return [
          objectInitializer({
            triples: `[${objectInitializer({
              object: variables.object,
              predicate: variables.predicate,
              subject: variables.subject,
            })}]`,
            type: '"bgp"',
          }),
        ].concat(
          this.sparqlWherePatterns({
            allowIgnoreRdfType,
            context: "subject",
            variables: {
              subject: variables.object,
              variablePrefix: variables.object.substring(
                objectPrefix.length,
                variables.object.length - objectSuffix.length,
              ),
            },
          }),
        );
      }
      case "subject":
        return [];
    }
  }

  /**
   * An expression that converts a value of this type to a JSON-LD compatible value. It can assume the presence
   * of the correct JSON-LD context.
   */
  abstract toJsonExpression(parameters: {
    variables: {
      value: string;
    };
  }): string;

  /**
   * An expression that converts a property value of this type to one that that can be .add'd to
   * an rdfjsResource.Resource.
   */
  abstract toRdfExpression(parameters: {
    variables: {
      predicate: string;
      mutateGraph: string;
      resource: string;
      resourceSet: string;
      value: string;
    };
  }): string;

  /**
   * Imports necessary to use this type.
   */
  abstract useImports(parameters: {
    features: Set<TsFeature>;
  }): readonly Import[];

  protected rdfjsTermExpression(
    rdfjsTerm:
      | Omit<BlankNode, "equals">
      | Omit<Literal, "equals">
      | Omit<NamedNode, "equals">
      | Omit<Variable, "equals">,
  ): string {
    return rdfjsTermExpression({
      dataFactoryVariable: this.dataFactoryVariable,
      rdfjsTerm,
    });
  }
}

export namespace Type {
  export interface Conversion {
    readonly conversionExpression: (value: string) => string;
    readonly sourceTypeCheckExpression: (value: string) => string;
    readonly sourceTypeName: string;
  }

  export interface DiscriminatorProperty {
    readonly name: string;
    readonly ownValues: readonly string[];
    readonly descendantValues: readonly string[];
  }
}
