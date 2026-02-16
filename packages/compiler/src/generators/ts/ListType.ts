import type { NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { rdf } from "@tpluscode/rdf-ns-builders";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import type { IdentifierMintingStrategy } from "../../enums/index.js";
import { AbstractCollectionType } from "./AbstractCollectionType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { BooleanType } from "./BooleanType.js";
import type { DateTimeType } from "./DateTimeType.js";
import type { DateType } from "./DateType.js";
import type { FloatType } from "./FloatType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IntType } from "./IntType.js";
import { imports } from "./imports.js";
import type { LiteralType } from "./LiteralType.js";
import type { NamedNodeType } from "./NamedNodeType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import type { StringType } from "./StringType.js";
import { snippets } from "./snippets.js";
import type { TermType } from "./TermType.js";
import type { Type } from "./Type.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";
import type { UnionType } from "./UnionType.js";

export class ListType<
  ItemTypeT extends ListType.ItemType,
> extends AbstractCollectionType<ItemTypeT> {
  private readonly identifierMintingStrategy: IdentifierMintingStrategy;
  private readonly identifierNodeKind: IdentifierNodeKind;
  private readonly toRdfTypes: readonly NamedNode[];

  readonly kind = "ListType";

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
  override get sparqlWherePatternsFunction(): Code {
    return code`${snippets.listSparqlWherePatterns}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.sparqlWherePatternsFunction})`;
  }

  override fromRdfExpression({
    variables,
  }: Parameters<
    AbstractCollectionType<ItemTypeT>["fromRdfExpression"]
  >[0]): Code {
    return joinCode(
      [
        variables.resourceValues,
        code`chain(values => values.chainMap(value => value.toList()))`, // Resource.Values<Resource.TermValue> to Resource.Values<Resource.TermValue[]>
        code`chain(valueLists =>
        valueLists.chainMap(
          valueList => ${this.itemType.fromRdfExpression({
            variables: {
              ...variables,
              resourceValues: code`${imports.Either}.of<Error, ${imports.Resource}.Values<${imports.Resource}.TermValue>>(${imports.Resource}.Values.fromArray({ focusResource: ${variables.resource}, predicate: ${variables.predicate}, values: valueList }))`,
            },
          })}
      ))`, // Resource.Values<Resource.TermValue[]> to Resource.Values<item type arrays>
        code`map(valueLists => valueLists.map(valueList => valueList.toArray()${this.mutable ? ".concat()" : ""}))`, // Convert inner Resource.Values to arrays
      ],
      { on: "." },
    );
  }

  @Memoize()
  override jsonType(): AbstractCollectionType.JsonType {
    return new AbstractCollectionType.JsonType(
      code`readonly (${this.itemType.jsonType().name})[]`,
    );
  }

  override sparqlConstructTriples({
    variables,
  }: Parameters<
    AbstractCollectionType<ItemTypeT>["sparqlConstructTriples"]
  >[0]): Maybe<Code> {
    const triples: Code[] = [];
    const listVariable = variables.valueVariable;
    const variable = (suffix: string) =>
      code`${imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}${suffix}\`)`;
    const variablePrefix = (suffix: string) =>
      code`\`\${${variables.variablePrefix}}${suffix}\``;

    {
      // ?list rdf:first ?item0
      const item0Variable = variable("Item0");
      triples.push(
        code`${{
          subject: listVariable,
          predicate: rdfjsTermExpression(rdf.first),
          object: item0Variable,
        }}`,
      );
      this.itemType
        .sparqlConstructTriples({
          allowIgnoreRdfType: true,
          variables: {
            valueVariable: item0Variable,
            variablePrefix: variablePrefix("Item0"),
          },
        })
        .ifJust((code_) => {
          triples.push(code`...${code_}`);
        });
    }

    {
      // ?list rdf:rest ?rest0
      const rest0Variable = variable("Rest0");
      triples.push(
        code`${{
          subject: listVariable,
          predicate: rdfjsTermExpression(rdf.rest),
          object: rest0Variable,
        }}`,
      );
    }

    // Don't do ?list rdf:rest+ ?restN in CONSTRUCT
    const restNVariable = variable("RestN");

    {
      // ?rest rdf:first ?itemN
      const itemNVariable = variable("ItemN");
      triples.push(
        code`${{
          subject: restNVariable,
          predicate: rdfjsTermExpression(rdf.first),
          object: itemNVariable,
        }}`,
      );
      this.itemType
        .sparqlConstructTriples({
          allowIgnoreRdfType: true,
          variables: {
            valueVariable: itemNVariable,
            variablePrefix: variablePrefix("ItemN"),
          },
        })
        .ifJust((code_) => {
          triples.push(code`...${code_}`);
        });
    }

    // ?restN rdf:rest ?restNBasic to get the rdf:rest statement in the CONSTRUCT
    triples.push(
      code`${{
        subject: restNVariable,
        predicate: rdfjsTermExpression(rdf.rest),
        object: variable("RestNBasic"),
      }}`,
    );

    return Maybe.of(code`[${joinCode(triples, { on: "," })}]`);
  }

  override toRdfExpression({
    variables,
  }: Parameters<
    AbstractCollectionType<ItemTypeT>["toRdfExpression"]
  >[0]): Code {
    let listIdentifier: Code;
    let mutableResourceTypeName: Code;
    let resourceSetMethodName: string;
    let subListIdentifier: Code;
    switch (this.identifierNodeKind) {
      case "BlankNode": {
        listIdentifier =
          subListIdentifier = code`${imports.dataFactory}.blankNode()`;
        mutableResourceTypeName = code`${imports.MutableResource}`;
        resourceSetMethodName = "mutableResource";
        break;
      }
      case "NamedNode": {
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
        mutableResourceTypeName = code`${imports.MutableResource}<${imports.NamedNode}>`;
        resourceSetMethodName = "mutableNamedResource";
        subListIdentifier = code`${imports.dataFactory}.namedNode(\`\${listResource.identifier.value}:\${itemIndex}\`)`;
        break;
      }
    }

    return code`[${variables.value}.length > 0 ? ${variables.value}.reduce(({ currentSubListResource, listResource }, item, itemIndex, list) => {
    if (itemIndex === 0) {
      currentSubListResource = listResource;
    } else {
      const newSubListResource = ${variables.resourceSet}.${resourceSetMethodName}(${subListIdentifier}, ${{
        mutateGraph: variables.mutateGraph,
      }});
      currentSubListResource!.add(${rdfjsTermExpression(rdf.rest)}, newSubListResource.identifier);
      currentSubListResource = newSubListResource;
    }
    
    ${joinCode(this.toRdfTypes.map((rdfType) => code`currentSubListResource.add(${rdfjsTermExpression(rdf.type)}, ${imports.dataFactory}.namedNode("${rdfType.value}"))`))}
        
    currentSubListResource.add(${rdfjsTermExpression(rdf.first)}, ...${this.itemType.toRdfExpression({ variables: { mutateGraph: variables.mutateGraph, predicate: rdfjsTermExpression(rdf.first), resource: code`currentSubListResource`, resourceSet: variables.resourceSet, value: code`item` } })});

    if (itemIndex + 1 === list.length) {
      currentSubListResource.add(${rdfjsTermExpression(rdf.rest)}, ${rdfjsTermExpression(rdf.nil)});
    }
    
    return { currentSubListResource, listResource };
  },
  {
    currentSubListResource: null,
    listResource: resourceSet.${resourceSetMethodName}(${listIdentifier}, ${{
      mutateGraph: variables.mutateGraph,
    }}),
  } as {
    currentSubListResource: ${mutableResourceTypeName} | null;
    listResource: ${mutableResourceTypeName};
  },
).listResource.identifier : ${rdfjsTermExpression(rdf.nil)}]`;
  }
}

export namespace ListType {
  export type ItemType =
    | BlankNodeType
    | BooleanType
    | DateTimeType
    | DateType
    | FloatType
    | IdentifierType
    | IntType
    | LiteralType
    | NamedNodeType
    | ObjectType
    | ObjectUnionType
    | StringType
    | TermType
    | UnionType;

  export function isItemType(type: Type): type is ItemType {
    switch (type.kind) {
      case "BlankNodeType":
      case "BooleanType":
      case "DateTimeType":
      case "DateType":
      case "FloatType":
      case "IdentifierType":
      case "IntType":
      case "LiteralType":
      case "NamedNodeType":
      case "ObjectType":
      case "ObjectUnionType":
      case "StringType":
      case "TermType":
      case "UnionType":
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
