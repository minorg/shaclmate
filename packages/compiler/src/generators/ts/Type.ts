import type { BlankNode, Literal, NamedNode, Variable } from "@rdfjs/types";
import { Maybe } from "purify-ts";
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
  /**
   * Expressions that convert a source type or types to this type. It should include the type itself.
   */
  abstract readonly conversions: readonly Type.Conversion[];

  /**
   * A function (reference or declaration) that compares two property values of this type, returning a
   * $EqualsResult.
   */
  abstract readonly equalsFunction: string;

  /**
   * JSON-compatible returned by propertyToJsonExpression.
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
  protected readonly dataFactoryVariable: string;

  constructor({
    dataFactoryVariable,
  }: {
    dataFactoryVariable: string;
  }) {
    this.dataFactoryVariable = dataFactoryVariable;
  }

  /**
   * A property that discriminates sub-types of this type e.g., termType on RDF/JS terms.
   */
  get discriminatorProperty(): Maybe<Type.DiscriminatorProperty> {
    return Maybe.empty();
  }

  /**
   * An expression that converts a JSON object in the same format as the propertyToJsonExpression to a value of this type.
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
  jsonUiSchemaElement(_parameters: {
    variables: { scopePrefix: string };
  }): Maybe<string> {
    return Maybe.empty();
  }

  /**
   * Zod schema for the JSON version of the type (the result of propertyToJson).
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
  snippetDeclarations(_features: Set<TsFeature>): readonly string[] {
    return [];
  }

  /**
   * An array of SPARQL.js CONSTRUCT template triples for a value of this type, as strings (so they can incorporate runtime calls).
   *
   * This method is called in two contexts:
   * (1) By an ObjectType.Property. The property expects a basic graph pattern (subject, property path, property object). The property calls this method to get additional triples in which the propertyObject is the subject. For example, if the type is a nested object, it would include (propertyObject, nestedPredicate, nestedObject) triples.
   * (2) By another Type. For example, ListType calls this method to with the item variable as a subject in order to chain additional patterns on items.
   *
   * Term types with no additional properties should return an empty array.
   */
  sparqlConstructTemplateTriples({
    context,
    variables,
  }:
    | {
        context: "property";
        variables: {
          object: string;
          predicate: string;
          subject: string;
          variablePrefix: string;
        };
      }
    | {
        context: "type";
        variables: {
          subject: string;
          variablePrefix: string;
        };
      }): readonly string[] {
    switch (context) {
      case "property": {
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
            context: "type",
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
      case "type":
        return [];
    }
  }

  /**
   * An array of SPARQL.js where patterns for a value of this type, as strings (so they can incorporate runtime calls).
   *
   * See note in sparqlConstructTemplateTriples re: how this method is used.
   */
  sparqlWherePatterns({
    context,
    variables,
  }:
    | {
        context: "property";
        variables: {
          object: string;
          predicate: string;
          subject: string;
          variablePrefix: string;
        };
      }
    | {
        context: "type";
        variables: {
          subject: string;
          variablePrefix: string;
        };
      }): readonly string[] {
    switch (context) {
      case "property": {
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
            context: "type",
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
      case "type":
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
  useImports(_features: Set<TsFeature>): readonly Import[] {
    return [];
  }

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
    readonly values: readonly string[];
  }
}
