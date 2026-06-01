import type { NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { rdf } from "@tpluscode/rdf-ns-builders";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractCollectionType } from "./AbstractCollectionType.js";
import type { BigDecimalType } from "./BigDecimalType.js";
import type { BigIntType } from "./BigIntType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { BooleanType } from "./BooleanType.js";
import type { DateTimeType } from "./DateTimeType.js";
import type { DateType } from "./DateType.js";
import type { FloatType } from "./FloatType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IntType } from "./IntType.js";
import type { IriType } from "./IriType.js";
import type { LiteralType } from "./LiteralType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { StringType } from "./StringType.js";
import type { TermType } from "./TermType.js";
import type { Type } from "./Type.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";
import type { UnionType } from "./UnionType.js";

export class ListType<
  ItemTypeT extends ListType.ItemType,
> extends AbstractCollectionType<ItemTypeT> {
  private readonly identifierNodeKind: IdentifierNodeKind;
  private readonly toRdfTypes: readonly NamedNode[];

  override readonly jsTypes = [
    { instanceof: "Array", typeof: "object" },
  ] as const;
  override readonly kind = "List";

  constructor({
    identifierNodeKind,
    toRdfTypes,
    ...superParameters
  }: {
    identifierNodeKind: ListType<ItemTypeT>["identifierNodeKind"];
    toRdfTypes: readonly NamedNode[];
  } & ConstructorParameters<typeof AbstractCollectionType<ItemTypeT>>[0]) {
    super(superParameters);
    this.identifierNodeKind = identifierNodeKind;
    this.toRdfTypes = toRdfTypes;
  }

  @Memoize()
  override get conversionFunction(): Maybe<AbstractCollectionType.ConversionFunction> {
    const itemConversionFunction = this.itemType.conversionFunction.orDefault(
      this.itemConversionFunctionDefault,
    );

    return Maybe.of({
      code: code`${this.reusables.snippets.convertToList}(${itemConversionFunction.code}, ${literalOf(!this._mutable)})`,
      sourceTypes: [
        {
          expression: code`readonly (${joinCode(
            itemConversionFunction.sourceTypes.map(
              (itemSourceType) => code`${itemSourceType.expression}`,
            ),
            { on: " | " },
          )})[]`,
          jsType: { instanceof: "Array", typeof: "object" },
        },
      ],
    });
  }

  @Memoize()
  override get toRdfResourceValueTypes(): AbstractCollectionType<ItemTypeT>["toRdfResourceValueTypes"] {
    return new Set(["BlankNode", "NamedNode"]); // List or rdf:nil
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Code {
    return code`${this.reusables.snippets.listSparqlConstructTriples}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlConstructTriplesFunction})`;
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return code`${this.reusables.snippets.listSparqlWherePatterns}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlWherePatternsFunction})`;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<
    AbstractCollectionType<ItemTypeT>["fromJsonExpression"]
  >[0]): Code {
    return code`${this.reusables.imports.Either}.sequence<Error, ${this.itemType.expression}>(${variables.value}.map(item => (${this.itemType.fromJsonExpression(
      {
        variables: { value: code`item` },
      },
    )})))`;
  }

  override fromRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractCollectionType<ItemTypeT>["fromRdfResourceValuesExpression"]
  >[0]): Code {
    return joinCode(
      [
        variables.resourceValues,
        code`chain(values => values.chainMap(value => value.toList(${{ graph: variables.graph }})))`, // Resource.Values<Resource.Value> to Resource.Values<Resource.Values>
        code`chain(valueLists =>
        valueLists.chainMap(
          valueList => ${this.itemType.fromRdfResourceValuesExpression({
            variables: {
              ...variables,
              resourceValues: code`${this.reusables.imports.Right}(${this.reusables.imports.Resource}.Values.fromArray({ focusResource: ${variables.resource}, propertyPath: ${variables.propertyPath}, values: valueList.toArray() }))`,
            },
          })}
      ))`, // Resource.Values<Resource.Values> to Resource.Values<item type arrays>
        code`map(valueLists => valueLists.map(valueList => valueList.toArray()${this.mutable ? ".concat()" : ""}))`, // Convert inner Resource.Values to arrays
      ],
      { on: "." },
    );
  }

  override jsonSchema(
    parameters: Parameters<AbstractCollectionType<ItemTypeT>["jsonSchema"]>[0],
  ): Code {
    let schema = code`${this.itemType.jsonSchema(parameters)}.array()`;
    if (!this._mutable) {
      schema = code`${schema}.readonly()`;
    }
    return schema;
  }

  @Memoize()
  override jsonType(): AbstractCollectionType.JsonType {
    return new AbstractCollectionType.JsonType(
      code`${!this.mutable ? "readonly " : ""}(${this.itemType.jsonType().expression})[]`,
    );
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractCollectionType<ItemTypeT>["toRdfResourceValuesExpression"]
  >[0]): Code {
    let mintListIdentifierFunction: Code;
    let mintSubListIdentifierFunction: Code;
    let resourceTypeExpression: Code;
    switch (this.identifierNodeKind) {
      case "BlankNode": {
        mintListIdentifierFunction =
          mintSubListIdentifierFunction = code`(() => ${this.reusables.imports.dataFactory}.blankNode())`;
        resourceTypeExpression = code`${this.reusables.imports.Resource}<${this.reusables.imports.BlankNode}>`;
        break;
      }
      case "IRI": {
        resourceTypeExpression = code`${this.reusables.imports.Resource}<${this.reusables.imports.NamedNode}>`;
        throw new RangeError("list IRI minting is unsupported");
      }
    }

    return code`[${variables.value}.length > 0 ? ${variables.value}.reduce(({ currentSubListResource, listResource }, item, itemIndex, list) => {
    if (itemIndex === 0) {
      currentSubListResource = listResource;
    } else {
      const newSubListResource = ${variables.resourceSet}.resource(${mintSubListIdentifierFunction}());
      currentSubListResource!.add(${this.rdfjsTermExpression(rdf.rest)}, newSubListResource.identifier, ${variables.graph});
      currentSubListResource = newSubListResource;
    }
    
    ${joinCode(this.toRdfTypes.map((rdfType) => code`currentSubListResource.add(${this.rdfjsTermExpression(rdf.type)}, ${this.reusables.imports.dataFactory}.namedNode("${rdfType.value}"), ${variables.graph})`))}
    
    currentSubListResource.add(${this.rdfjsTermExpression(rdf.first)}, ${this.itemType.toRdfResourceValuesExpression({ variables: { graph: variables.graph, propertyPath: this.rdfjsTermExpression(rdf.first), resource: code`currentSubListResource`, resourceSet: variables.resourceSet, value: code`item` } })}, ${variables.graph});

    if (itemIndex + 1 === list.length) {
      currentSubListResource.add(${this.rdfjsTermExpression(rdf.rest)}, ${this.rdfjsTermExpression(rdf.nil)}, ${variables.graph});
    }
    
    return { currentSubListResource, listResource };
  },
  {
    currentSubListResource: null,
    listResource: ${variables.resourceSet}.resource(${mintListIdentifierFunction}()),
  } as {
    currentSubListResource: ${resourceTypeExpression} | null;
    listResource: ${resourceTypeExpression};
  },
).listResource.identifier : ${this.rdfjsTermExpression(rdf.nil)}]`;
  }

  override toStringExpression({
    variables,
  }: Parameters<
    AbstractCollectionType<ItemTypeT>["toStringExpression"]
  >[0]): Code {
    return code`\`[\${${variables.value}.map(item => (${this.itemType.toStringExpression({ variables: { value: code`item` } })}))}]\``;
  }
}

export namespace ListType {
  export type ItemType =
    | BigDecimalType
    | BigIntType
    | BlankNodeType
    | BooleanType
    | DateTimeType
    | DateType
    | FloatType
    | IdentifierType
    | IntType
    | IriType
    | ListType<ListType.ItemType>
    | LiteralType
    | ObjectUnionType
    | ObjectType
    | StringType
    | TermType
    | UnionType<Type>;

  export function isItemType(type: Type): type is ItemType {
    switch (type.kind) {
      case "BigDecimal":
      case "BigInt":
      case "BlankNode":
      case "Boolean":
      case "DateTime":
      case "Date":
      case "Float":
      case "Identifier":
      case "Iri":
      case "Int":
      case "List":
      case "Literal":
      case "ObjectUnion":
      case "Object":
      case "String":
      case "Term":
      case "Union":
        return true;
      case "DefaultValue":
      case "LazyOption":
      case "LazySet":
      case "Lazy":
      case "Option":
      case "Set":
        return false;
    }
  }
}
