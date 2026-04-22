import type { NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { rdf } from "@tpluscode/rdf-ns-builders";

import type { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import type { IdentifierMintingStrategy } from "../../enums/IdentifierMintingStrategy.js";
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
import { imports } from "./imports.js";
import type { LiteralType } from "./LiteralType.js";
import type { NamedObjectType } from "./NamedObjectType.js";
import type { NamedObjectUnionType } from "./NamedObjectUnionType.js";
import type { NamedUnionType } from "./NamedUnionType.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import type { StringType } from "./StringType.js";
import { snippets } from "./snippets.js";
import type { TermType } from "./TermType.js";
import type { Type } from "./Type.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class ListType<
  ItemTypeT extends ListType.ItemType,
> extends AbstractCollectionType<ItemTypeT> {
  private readonly identifierMintingStrategy: IdentifierMintingStrategy;
  private readonly identifierNodeKind: IdentifierNodeKind;
  private readonly toRdfTypes: readonly NamedNode[];

  override readonly kind = "ListType";

  constructor({
    identifierNodeKind,
    identifierMintingStrategy,
    toRdfTypes,
    ...superParameters
  }: {
    identifierNodeKind: ListType<ItemTypeT>["identifierNodeKind"];
    identifierMintingStrategy: Maybe<IdentifierMintingStrategy>;
    toRdfTypes: readonly NamedNode[];
  } & ConstructorParameters<typeof AbstractCollectionType<ItemTypeT>>[0]) {
    super(superParameters);
    this.identifierNodeKind = identifierNodeKind;
    this.identifierMintingStrategy = identifierMintingStrategy.orDefault(
      identifierNodeKind === "BlankNode" ? "blankNode" : "sha256",
    );
    this.toRdfTypes = toRdfTypes;
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Code {
    return code`${snippets.listSparqlConstructTriples}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlConstructTriplesFunction})`;
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return code`${snippets.listSparqlWherePatterns}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlWherePatternsFunction})`;
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
              resourceValues: code`${imports.Right}(${imports.Resource}.Values.fromArray({ focusResource: ${variables.resource}, propertyPath: ${variables.propertyPath}, values: valueList.toArray() }))`,
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
    let listIdentifier: Code;
    let resourceTypeName: Code;
    let subListIdentifier: Code;
    switch (this.identifierNodeKind) {
      case "BlankNode": {
        listIdentifier =
          subListIdentifier = code`${imports.dataFactory}.blankNode()`;
        resourceTypeName = code`${imports.Resource}<${imports.BlankNode}>`;
        break;
      }
      case "IRI": {
        switch (this.identifierMintingStrategy) {
          case "blankNode":
            throw new RangeError(this.identifierMintingStrategy);
          case "sha256":
            listIdentifier = code`${imports.dataFactory}.namedNode(\`urn:shaclmate:list:\${${variables.value}.reduce(
        (hasher, item) => {
          ${joinCode(this.itemType.hashStatements({ depth: 0, variables: { hasher: code`hasher`, value: code`item` } }).concat())}
          return hasher;
        },
        ${imports.sha256}.create(),
      )}\`)`;
            break;
          case "uuidv4":
            listIdentifier = code`${imports.dataFactory}.namedNode(\`urn:shaclmate:list:\${${imports.uuid}.v4()}\`)`;
            break;
        }
        resourceTypeName = code`${imports.Resource}<${imports.NamedNode}>`;
        subListIdentifier = code`${imports.dataFactory}.namedNode(\`\${listResource.identifier.value}:\${itemIndex}\`)`;
        break;
      }
    }

    return code`[${variables.value}.length > 0 ? ${variables.value}.reduce(({ currentSubListResource, listResource }, item, itemIndex, list) => {
    if (itemIndex === 0) {
      currentSubListResource = listResource;
    } else {
      const newSubListResource = ${variables.resourceSet}.resource(${subListIdentifier});
      currentSubListResource!.add(${rdfjsTermExpression(rdf.rest)}, newSubListResource.identifier, ${variables.graph});
      currentSubListResource = newSubListResource;
    }
    
    ${joinCode(this.toRdfTypes.map((rdfType) => code`currentSubListResource.add(${rdfjsTermExpression(rdf.type)}, ${imports.dataFactory}.namedNode("${rdfType.value}"), ${variables.graph})`))}
    
    currentSubListResource.add(${rdfjsTermExpression(rdf.first)}, ${this.itemType.toRdfResourceValuesExpression({ variables: { graph: variables.graph, propertyPath: rdfjsTermExpression(rdf.first), resource: code`currentSubListResource`, resourceSet: variables.resourceSet, value: code`item` } })}, ${variables.graph});

    if (itemIndex + 1 === list.length) {
      currentSubListResource.add(${rdfjsTermExpression(rdf.rest)}, ${rdfjsTermExpression(rdf.nil)}, ${variables.graph});
    }
    
    return { currentSubListResource, listResource };
  },
  {
    currentSubListResource: null,
    listResource: resourceSet.resource(${listIdentifier}),
  } as {
    currentSubListResource: ${resourceTypeName} | null;
    listResource: ${resourceTypeName};
  },
).listResource.identifier : ${rdfjsTermExpression(rdf.nil)}]`;
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
