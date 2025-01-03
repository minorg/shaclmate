import type { NamedNode } from "@rdfjs/types";
import { NodeKind } from "@shaclmate/shacl-ast";
import { rdf } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import type { MintingStrategy } from "../../enums/index.js";
import { Import } from "./Import.js";
import { Type } from "./Type.js";

export class ListType extends Type {
  readonly itemType: Type;
  readonly kind = "ListType";
  override readonly mutable: boolean;
  private readonly fromRdfType: Maybe<NamedNode>;
  private readonly identifierNodeKind: NodeKind.BLANK_NODE | NodeKind.IRI;
  private readonly mintingStrategy: MintingStrategy;
  private readonly toRdfTypes: readonly NamedNode[];

  constructor({
    identifierNodeKind,
    itemType,
    mintingStrategy,
    mutable,
    fromRdfType,
    toRdfTypes,
    ...superParameters
  }: {
    fromRdfType: Maybe<NamedNode>;
    identifierNodeKind: ListType["identifierNodeKind"];
    itemType: Type;
    mintingStrategy: Maybe<MintingStrategy>;
    mutable: boolean;
    toRdfTypes: readonly NamedNode[];
  } & ConstructorParameters<typeof Type>[0]) {
    super(superParameters);
    this.identifierNodeKind = identifierNodeKind;
    this.itemType = itemType;
    this.mintingStrategy = mintingStrategy.orDefault("sha256");
    this.mutable = mutable;
    this.fromRdfType = fromRdfType;
    this.toRdfTypes = toRdfTypes;
  }

  override get conversions(): readonly Type.Conversion[] {
    return [
      {
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) => `Array.isArray(${value})`,
        sourceTypeName: this.name,
      },
    ];
  }

  override get discriminatorProperty(): Maybe<Type.DiscriminatorProperty> {
    return Maybe.empty();
  }

  override get equalsFunction(): string {
    return `((left, right) => purifyHelpers.Arrays.equals(left, right, ${this.itemType.equalsFunction}))`;
  }

  override get jsonName(): string {
    return `readonly (${this.itemType.jsonName})[]`;
  }

  override get name(): string {
    return `${this.mutable ? "" : "readonly "}${this.itemType.name}[]`;
  }

  override get useImports(): readonly Import[] {
    const imports: Import[] = this.itemType.useImports.concat();
    if (this.identifierNodeKind === NodeKind.IRI) {
      imports.push(Import.SHA256);
    }
    return imports;
  }

  override propertyChainSparqlGraphPatternExpression({
    variables,
  }: Parameters<
    Type["propertyChainSparqlGraphPatternExpression"]
  >[0]): Maybe<Type.SparqlGraphPatternsExpression> {
    return Maybe.of(
      new Type.SparqlGraphPatternsExpression(
        `new sparqlBuilder.RdfListGraphPatterns({ ${this.itemType
          .propertyChainSparqlGraphPatternExpression({
            variables: {
              subject: "_itemVariable",
            },
          })
          .map(
            (itemSparqlGraphPatternsExpression) =>
              `itemGraphPatterns: (_itemVariable) => ${itemSparqlGraphPatternsExpression.toSparqlGraphPatternsExpression()}, `,
          )
          .orDefault(
            "",
          )} ${this.fromRdfType.map((fromRdfType) => `rdfListType: ${this.rdfjsTermExpression(fromRdfType)}, `).orDefault("")} rdfList: ${variables.subject} })`,
      ),
    );
  }

  override propertyFromRdfExpression({
    variables,
  }: Parameters<Type["propertyFromRdfExpression"]>[0]): string {
    const chain: string[] = [variables.resourceValues];
    chain.push("head()");
    this.fromRdfType.ifJust((fromRdfType) => {
      chain.push(
        `chain(value => value.toResource().map(resource => resource.isInstanceOf(${this.rdfjsTermExpression(fromRdfType)})).orDefault(false) ? purify.Right<rdfjsResource.Resource.Value, rdfjsResource.Resource.ValueError>(value) : purify.Left<rdfjsResource.Resource.ValueError, rdfjsResource.Resource.Value>(new rdfjsResource.Resource.ValueError({ focusResource: ${variables.resource}, message: "unexpected RDF type", predicate: ${this.rdfjsTermExpression(fromRdfType)} })))`,
      );
    });
    chain.push("chain(value => value.toList())");
    chain.push(
      `map(values => values.flatMap(_value => ${this.itemType.propertyFromRdfExpression({ variables: { ...variables, resourceValues: "_value.toValues()" } })}.toMaybe().toList()))`,
    );
    return chain.join(".");
  }

  override propertyHashStatements({
    depth,
    variables,
  }: Parameters<Type["propertyHashStatements"]>[0]): readonly string[] {
    return [
      `for (const _element${depth} of ${variables.value}) { ${this.itemType.propertyHashStatements({ depth: depth + 1, variables: { ...variables, value: `_element${depth}` } }).join("\n")} }`,
    ];
  }

  override propertyToJsonExpression({
    variables,
  }: Parameters<Type["propertyToJsonExpression"]>[0]): string {
    return `${variables.value}.map(_item => (${this.itemType.propertyToJsonExpression({ variables: { value: "_item" } })}))`;
  }

  override propertyToRdfExpression({
    variables,
  }: Parameters<Type["propertyToRdfExpression"]>[0]): string {
    let listIdentifier: string;
    let mutableResourceTypeName: string;
    let resourceSetMethodName: string;
    let subListIdentifier: string;
    switch (this.identifierNodeKind) {
      case NodeKind.BLANK_NODE: {
        listIdentifier = subListIdentifier = "dataFactory.blankNode()";
        mutableResourceTypeName = "rdfjsResource.MutableResource";
        resourceSetMethodName = "mutableResource";
        break;
      }
      case NodeKind.IRI: {
        switch (this.mintingStrategy) {
          case "sha256":
            listIdentifier = `dataFactory.namedNode(\`urn:shaclmate:list:\${${variables.value}.reduce(
        (_hasher, _item) => {
          ${this.itemType.propertyHashStatements({ depth: 0, variables: { hasher: "_hasher", value: "_item" } })}
          return _hasher;
        },
        sha256.create(),
      )}\`)`;
            break;
          case "uuidv4":
            listIdentifier =
              "dataFactory.namedNode(`urn:shaclmate:list:${uuid.v4()}`)";
            break;
        }
        mutableResourceTypeName =
          "rdfjsResource.MutableResource<rdfjs.NamedNode>";
        resourceSetMethodName = "mutableNamedResource";
        subListIdentifier =
          "dataFactory.namedNode(`${listResource.identifier.value}:${itemIndex}`)";
        break;
      }
    }

    return `${variables.value}.reduce(({ currentSubListResource, listResource }, item, itemIndex, list) => {
    if (itemIndex === 0) {
      currentSubListResource = listResource;
    } else {
      const newSubListResource = ${variables.resourceSet}.${resourceSetMethodName}({
        identifier: ${subListIdentifier},
        mutateGraph: ${variables.mutateGraph},
      });
      currentSubListResource!.add(dataFactory.namedNode("${rdf.rest.value}"), newSubListResource.identifier);
      currentSubListResource = newSubListResource;
    }
    
    ${this.toRdfTypes.map((rdfType) => `currentSubListResource.add(dataFactory.namedNode("${rdf.type.value}"), dataFactory.namedNode("${rdfType.value}"))`).join("\n")}
        
    currentSubListResource.add(dataFactory.namedNode("${rdf.first.value}"), ${this.itemType.propertyToRdfExpression({ variables: { mutateGraph: variables.mutateGraph, predicate: `dataFactory.namedNode("${rdf.first.value}")`, resource: "currentSubListResource", resourceSet: variables.resourceSet, value: "item" } })});

    if (itemIndex + 1 === list.length) {
      currentSubListResource.add(dataFactory.namedNode("${rdf.rest.value}"), dataFactory.namedNode("${rdf.nil.value}"));
    }
    
    return { currentSubListResource, listResource };
  },
  {
    currentSubListResource: null,
    listResource: resourceSet.${resourceSetMethodName}({
      identifier: ${listIdentifier},
      mutateGraph: ${variables.mutateGraph}
    }),
  } as {
    currentSubListResource: ${mutableResourceTypeName} | null;
    listResource: ${mutableResourceTypeName};
  },
).listResource.identifier`;
  }
}
