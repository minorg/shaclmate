import type { NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { rdf } from "@tpluscode/rdf-ns-builders";

import type { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import type { IdentifierMintingStrategy } from "../../enums/index.js";
import { AbstractCollectionType } from "./AbstractCollectionType.js";
import type { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { BooleanType } from "./BooleanType.js";
import type { DateTimeType } from "./DateTimeType.js";
import type { DateType } from "./DateType.js";
import type { FloatType } from "./FloatType.js";
import type { IdentifierType } from "./IdentifierType.js";
import { Import } from "./Import.js";
import type { IntType } from "./IntType.js";
import type { LiteralType } from "./LiteralType.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import type { NamedNodeType } from "./NamedNodeType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import { objectInitializer } from "./objectInitializer.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import type { SnippetDeclaration } from "./SnippetDeclaration.js";
import type { StringType } from "./StringType.js";
import { sharedSnippetDeclarations } from "./sharedSnippetDeclarations.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { TermType } from "./TermType.js";
import type { Type } from "./Type.js";
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
  override get sparqlWherePatternsFunction(): string {
    return `${syntheticNamePrefix}listSparqlWherePatterns<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.sparqlWherePatternsFunction})`;
  }

  override fromRdfExpression({
    variables,
  }: Parameters<
    AbstractCollectionType<ItemTypeT>["fromRdfExpression"]
  >[0]): string {
    return [
      variables.resourceValues,
      "chain(values => values.chainMap(value => value.toList()))", // Resource.Values<Resource.TermValue> to Resource.Values<Resource.TermValue[]>
      `chain(valueLists =>
        valueLists.chainMap(
          valueList => ${this.itemType.fromRdfExpression({
            variables: {
              ...variables,
              resourceValues: `purify.Either.of<Error, rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>>(rdfjsResource.Resource.Values.fromArray({ focusResource: ${variables.resource}, predicate: ${variables.predicate}, values: valueList }))`,
            },
          })}
      ))`, // Resource.Values<Resource.TermValue[]> to Resource.Values<item type arrays>
      `map(valueLists => valueLists.map(valueList => valueList.toArray()${this.mutable ? ".concat()" : ""}))`, // Convert inner Resource.Values to arrays
    ].join(".");
  }

  @Memoize()
  override jsonType(): AbstractCollectionType.JsonType {
    return new AbstractCollectionType.JsonType(
      `readonly (${this.itemType.jsonType().name})[]`,
    );
  }

  override snippetDeclarations(
    parameters: Parameters<AbstractType["snippetDeclarations"]>[0],
  ): Readonly<Record<string, SnippetDeclaration>> {
    return mergeSnippetDeclarations(
      super.snippetDeclarations(parameters),

      parameters.features.has("sparql")
        ? singleEntryRecord(`${syntheticNamePrefix}listSparqlWherePatterns`, {
            code: `\
function ${syntheticNamePrefix}listSparqlWherePatterns<ItemFilterT, ItemSchemaT>(itemSparqlWherePatternsFunction: ${syntheticNamePrefix}SparqlWherePatternsFunction<ItemFilterT, ItemSchemaT>): ${syntheticNamePrefix}SparqlWherePatternsFunction<${syntheticNamePrefix}CollectionFilter<ItemFilterT>, ${syntheticNamePrefix}CollectionSchema<ItemSchemaT>> {
  return (parameters) => {
    // Need to handle two cases:
    // (1) (?s, ?p, ?list) where ?list binds to rdf:nil
    // (2) (?s, ?p, ?list) (?list, rdf:first, "element") (?list, rdf:rest, rdf:nil) etc. where list binds to the head of a list
    // Case (2) is case (1) with OPTIONAL graph patterns to handle actual list elements.

    const listVariable = parameters.valueVariable;
    const patterns: ${syntheticNamePrefix}SparqlPattern[] = [];
    const variable = (suffix: string) => dataFactory.variable!(\`\${parameters.variablePrefix}\${suffix}\`);
    const variablePrefix = (suffix: string) => \`\${parameters.variablePrefix}\${suffix}\`;

    {
      // ?list rdf:first ?item0
      const item0Variable = variable("Item0");
      patterns.push(
        {
          triples: [
            {
              subject: listVariable,
              predicate: ${rdfjsTermExpression(rdf.first)},
              object: item0Variable,
            },
          ],
          type: "bgp",
        },
        ...itemSparqlWherePatternsFunction({
          filter: parameters.filter,
          preferredLanguages: parameters.preferredLanguages,
          propertyPatterns: [],
          schema: parameters.schema.item,
          valueVariable: item0Variable,
          variablePrefix: variablePrefix("Item0"),
        }),
      );
    }

    {
      // ?list rdf:rest ?rest0
      const rest0Variable = variable("Rest0");
      patterns.push({
        triples: [
          {
            subject: listVariable,
            predicate: ${rdfjsTermExpression(rdf.rest)},
            object: rest0Variable,
          },
        ],
        type: "bgp",
      });
    }

    const optionalPatterns: ${syntheticNamePrefix}SparqlPattern[] = [];
    
    const restNVariable = variable("RestN");
    // ?list rdf:rest+ ?restN
    optionalPatterns.push({
      type: "bgp",
      triples: [
        {
          subject: listVariable,
          predicate: { type: "path", pathType: "*", items: [${rdfjsTermExpression(rdf.rest)}] },
          object: restNVariable,
        },
      ],
    });

    {
      // ?rest rdf:first ?itemN
      const itemNVariable = variable("ItemN");
      optionalPatterns.push(
        {
          triples: [
            {
              subject: restNVariable,
              predicate: ${rdfjsTermExpression(rdf.first)},
              object: itemNVariable,
            },
          ],
          type: "bgp"
        },
        ...itemSparqlWherePatternsFunction({
          filter: parameters.filter,
          preferredLanguages: parameters.preferredLanguages,
          propertyPatterns: [],
          schema: parameters.schema.item,
          valueVariable: itemNVariable,
          variablePrefix: variablePrefix("ItemN"),
        }),
      );
    }

    // ?restN rdf:rest ?restNBasic to get the rdf:rest statement in the CONSTRUCT
    optionalPatterns.push({
      triples: [
        {
          subject: restNVariable,
          predicate: ${rdfjsTermExpression(rdf.rest)},
          object: variable("RestNBasic"),
        },
      ],
      type: "bgp"
    });

    patterns.push({ type: "optional", patterns: optionalPatterns });

    // Having an optional around everything handles the rdf:nil case
    return [...parameters.propertyPatterns, { patterns, type: "optional" }];
  }
}`,
            dependencies: {
              ...sharedSnippetDeclarations.SparqlWherePatternsFunction,
            },
          })
        : {},
    );
  }

  override sparqlConstructTriples({
    variables,
  }: Parameters<
    AbstractCollectionType<ItemTypeT>["sparqlConstructTriples"]
  >[0]): readonly (AbstractCollectionType.SparqlConstructTriple | string)[] {
    const triples: (AbstractCollectionType.SparqlConstructTriple | string)[] =
      [];
    const listVariable = variables.valueVariable;
    const variable = (suffix: string) =>
      `dataFactory.variable!(\`\${${variables.variablePrefix}}${suffix}\`)`;
    const variablePrefix = (suffix: string) =>
      `\`\${${variables.variablePrefix}}${suffix}\``;

    {
      // ?list rdf:first ?item0
      const item0Variable = variable("Item0");
      triples.push(
        {
          subject: listVariable,
          predicate: rdfjsTermExpression(rdf.first),
          object: item0Variable,
        },
        ...this.itemType.sparqlConstructTriples({
          allowIgnoreRdfType: true,
          variables: {
            valueVariable: item0Variable,
            variablePrefix: variablePrefix("Item0"),
          },
        }),
      );
    }

    {
      // ?list rdf:rest ?rest0
      const rest0Variable = variable("Rest0");
      triples.push({
        subject: listVariable,
        predicate: rdfjsTermExpression(rdf.rest),
        object: rest0Variable,
      });
    }

    // Don't do ?list rdf:rest+ ?restN in CONSTRUCT
    const restNVariable = variable("RestN");

    {
      // ?rest rdf:first ?itemN
      const itemNVariable = variable("ItemN");
      triples.push(
        {
          subject: restNVariable,
          predicate: rdfjsTermExpression(rdf.first),
          object: itemNVariable,
        },
        ...this.itemType.sparqlConstructTriples({
          allowIgnoreRdfType: true,
          variables: {
            valueVariable: itemNVariable,
            variablePrefix: variablePrefix("ItemN"),
          },
        }),
      );
    }

    // ?restN rdf:rest ?restNBasic to get the rdf:rest statement in the CONSTRUCT
    triples.push({
      subject: restNVariable,
      predicate: rdfjsTermExpression(rdf.rest),
      object: variable("RestNBasic"),
    });

    return triples;
  }

  override toRdfExpression({
    variables,
  }: Parameters<
    AbstractCollectionType<ItemTypeT>["toRdfExpression"]
  >[0]): string {
    let listIdentifier: string;
    let mutableResourceTypeName: string;
    let resourceSetMethodName: string;
    let subListIdentifier: string;
    switch (this.identifierNodeKind) {
      case "BlankNode": {
        listIdentifier = subListIdentifier = "dataFactory.blankNode()";
        mutableResourceTypeName = "rdfjsResource.MutableResource";
        resourceSetMethodName = "mutableResource";
        break;
      }
      case "NamedNode": {
        switch (this.identifierMintingStrategy) {
          case "blankNode":
            throw new RangeError(this.identifierMintingStrategy);
          case "sha256":
            listIdentifier = `dataFactory.namedNode(\`urn:shaclmate:list:\${${variables.value}.reduce(
        (hasher, item) => {
          ${this.itemType.hashStatements({ depth: 0, variables: { hasher: "hasher", value: "item" } }).join("\n")}
          return hasher;
        },
        sha256.create(),
      )}\`)`;
            break;
          case "uuidv4":
            listIdentifier =
              // biome-ignore lint/suspicious/noTemplateCurlyInString: necessary
              "dataFactory.namedNode(`urn:shaclmate:list:${uuid.v4()}`)";
            break;
        }
        mutableResourceTypeName =
          "rdfjsResource.MutableResource<rdfjs.NamedNode>";
        resourceSetMethodName = "mutableNamedResource";
        subListIdentifier =
          // biome-ignore lint/suspicious/noTemplateCurlyInString: necessary
          "dataFactory.namedNode(`${listResource.identifier.value}:${itemIndex}`)";
        break;
      }
    }

    return `[${variables.value}.length > 0 ? ${variables.value}.reduce(({ currentSubListResource, listResource }, item, itemIndex, list) => {
    if (itemIndex === 0) {
      currentSubListResource = listResource;
    } else {
      const newSubListResource = ${variables.resourceSet}.${resourceSetMethodName}(${subListIdentifier}, ${objectInitializer(
        {
          mutateGraph: variables.mutateGraph,
        },
      )});
      currentSubListResource!.add(${rdfjsTermExpression(rdf.rest)}, newSubListResource.identifier);
      currentSubListResource = newSubListResource;
    }
    
    ${this.toRdfTypes.map((rdfType) => `currentSubListResource.add(${rdfjsTermExpression(rdf.type)}, dataFactory.namedNode("${rdfType.value}"))`).join("\n")}
        
    currentSubListResource.add(${rdfjsTermExpression(rdf.first)}, ...${this.itemType.toRdfExpression({ variables: { mutateGraph: variables.mutateGraph, predicate: rdfjsTermExpression(rdf.first), resource: "currentSubListResource", resourceSet: variables.resourceSet, value: "item" } })});

    if (itemIndex + 1 === list.length) {
      currentSubListResource.add(${rdfjsTermExpression(rdf.rest)}, ${rdfjsTermExpression(rdf.nil)});
    }
    
    return { currentSubListResource, listResource };
  },
  {
    currentSubListResource: null,
    listResource: resourceSet.${resourceSetMethodName}(${listIdentifier}, ${objectInitializer(
      {
        mutateGraph: variables.mutateGraph,
      },
    )}),
  } as {
    currentSubListResource: ${mutableResourceTypeName} | null;
    listResource: ${mutableResourceTypeName};
  },
).listResource.identifier : ${rdfjsTermExpression(rdf.nil)}]`;
  }

  override useImports(
    parameters: Parameters<AbstractCollectionType<ItemTypeT>["useImports"]>[0],
  ): readonly Import[] {
    const imports: Import[] = this.itemType.useImports(parameters).concat();
    if (
      parameters.features.has("hash") &&
      this.identifierNodeKind === "NamedNode"
    ) {
      imports.push(Import.SHA256);
    }
    return imports;
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
