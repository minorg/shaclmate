import type { NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { rdf } from "@tpluscode/rdf-ns-builders";

import { Memoize } from "typescript-memoize";

import { AbstractCollectionType } from "./AbstractCollectionType.js";
import type { AnonymousUnionType } from "./AnonymousUnionType.js";
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
import type { NamedObjectType } from "./NamedObjectType.js";
import type { NamedObjectUnionType } from "./NamedObjectUnionType.js";
import type { NamedUnionType } from "./NamedUnionType.js";
import type { StringType } from "./StringType.js";

import type { TermType } from "./TermType.js";
import type { Type } from "./Type.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class ListType<
  ItemTypeT extends ListType.ItemType,
> extends AbstractCollectionType<ItemTypeT> {
  private readonly identifierNodeKind: IdentifierNodeKind;
  private readonly toRdfTypes: readonly NamedNode[];

  override readonly kind = "ListType";

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
  override get valueSparqlConstructTriplesFunction(): Code {
    return code`${this.reusables.snippets.listSparqlConstructTriples}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlConstructTriplesFunction})`;
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return code`${this.reusables.snippets.listSparqlWherePatterns}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlWherePatternsFunction})`;
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

  @Memoize()
  override jsonType(): AbstractCollectionType.JsonType {
    return new AbstractCollectionType.JsonType(
      code`${!this.mutable ? "readonly " : ""}(${this.itemType.jsonType().name})[]`,
    );
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractCollectionType<ItemTypeT>["toRdfResourceValuesExpression"]
  >[0]): Code {
    let mintListIdentifierFunction: Code;
    let mintSubListIdentifierFunction: Code;
    let resourceTypeName: Code;
    switch (this.identifierNodeKind) {
      case "BlankNode": {
        mintListIdentifierFunction =
          mintSubListIdentifierFunction = code`(() => ${this.reusables.imports.dataFactory}.blankNode())`;
        resourceTypeName = code`${this.reusables.imports.Resource}<${this.reusables.imports.BlankNode}>`;
        break;
      }
      case "IRI": {
        resourceTypeName = code`${this.reusables.imports.Resource}<${this.reusables.imports.NamedNode}>`;
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
    listResource: resourceSet.resource(${mintListIdentifierFunction}()),
  } as {
    currentSubListResource: ${resourceTypeName} | null;
    listResource: ${resourceTypeName};
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
    | AnonymousUnionType
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
    | LiteralType
    | NamedObjectUnionType
    | NamedUnionType
    | NamedObjectType
    | StringType
    | TermType;

  export function isItemType(type: Type): type is ItemType {
    switch (type.kind) {
      case "AnonymousUnionType":
      case "BigDecimalType":
      case "BigIntType":
      case "BlankNodeType":
      case "BooleanType":
      case "DateTimeType":
      case "DateType":
      case "FloatType":
      case "IdentifierType":
      case "IriType":
      case "IntType":
      case "LiteralType":
      case "NamedObjectUnionType":
      case "NamedUnionType":
      case "NamedObjectType":
      case "StringType":
      case "TermType":
        return true;
      case "DefaultValueType":
      case "LazyObjectOptionType":
      case "LazyObjectSetType":
      case "LazyObjectType":
      case "ListType":
      case "OptionType":
      case "SetType":
        return false;
    }
  }
}
