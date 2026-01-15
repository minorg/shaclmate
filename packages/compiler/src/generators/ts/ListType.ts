import type { NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { rdf } from "@tpluscode/rdf-ns-builders";
import type { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import type { IdentifierMintingStrategy } from "../../enums/index.js";
import { AbstractCollectionType } from "./AbstractCollectionType.js";
import { Import } from "./Import.js";
import { objectInitializer } from "./objectInitializer.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { Type } from "./Type.js";

export class ListType<
  ItemTypeT extends Type,
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
  override jsonType(): Type.JsonType {
    return new Type.JsonType(`readonly (${this.itemType.jsonType().name})[]`);
  }

  override fromRdfExpression({
    variables,
  }: Parameters<Type["fromRdfExpression"]>[0]): string {
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

  override sparqlConstructTriples({
    variables,
  }: Parameters<Type["sparqlConstructTriples"]>[0]): readonly string[] {
    const triples: string[] = [];
    const listVariable = variables.valueVariable;
    const variable = (suffix: string) =>
      `dataFactory.variable!(\`\${${variables.variablePrefix}}${suffix}\`)`;
    const variablePrefix = (suffix: string) =>
      `\`\${${variables.variablePrefix}}${suffix}\``;

    {
      // ?list rdf:first ?item0
      const item0Variable = variable("Item0");
      triples.push(
        objectInitializer({
          subject: listVariable,
          predicate: rdfjsTermExpression(rdf.first),
          object: item0Variable,
        }),
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
      triples.push(
        objectInitializer({
          subject: listVariable,
          predicate: rdfjsTermExpression(rdf.rest),
          object: rest0Variable,
        }),
      );
    }

    // Don't do ?list rdf:rest+ ?restN in CONSTRUCT
    const restNVariable = variable("RestN");

    {
      // ?rest rdf:first ?itemN
      const itemNVariable = variable("ItemN");
      triples.push(
        objectInitializer({
          subject: restNVariable,
          predicate: rdfjsTermExpression(rdf.first),
          object: itemNVariable,
        }),
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
    triples.push(
      objectInitializer({
        subject: restNVariable,
        predicate: rdfjsTermExpression(rdf.rest),
        object: variable("RestNBasic"),
      }),
    );

    return triples;
  }

  override sparqlWherePatterns({
    propertyPatterns,
    variables,
  }: Parameters<Type["sparqlWherePatterns"]>[0]): Type.SparqlWherePatterns {
    // Need to handle two cases:
    // (1) (?s, ?p, ?list) where ?list binds to rdf:nil
    // (2) (?s, ?p, ?list) (?list, rdf:first, "element") (?list, rdf:rest, rdf:nil) etc. where list binds to the head of a list
    // Case (2) is case (1) with OPTIONAL graph patterns to handle actual list elements.

    const patterns: string[] = [];
    const listVariable = variables.valueVariable;
    const variable = (suffix: string) =>
      `dataFactory.variable!(\`\${${variables.variablePrefix}}${suffix}\`)`;
    const variablePrefix = (suffix: string) =>
      `\`\${${variables.variablePrefix}}${suffix}\``;

    {
      // ?list rdf:first ?item0
      const item0Variable = variable("Item0");
      patterns.push(
        `{ type: "bgp", triples: [${objectInitializer({
          subject: listVariable,
          predicate: rdfjsTermExpression(rdf.first),
          object: item0Variable,
        })}] }`,
        ...this.itemType
          .sparqlWherePatterns({
            allowIgnoreRdfType: true,
            propertyPatterns: [],
            variables: {
              filter: variables.filter.map((filter) => `${filter}?.items`),
              preferredLanguages: variables.preferredLanguages,
              valueVariable: item0Variable,
              variablePrefix: variablePrefix("Item0"),
            },
          })
          .toArray(),
      );
    }

    {
      // ?list rdf:rest ?rest0
      const rest0Variable = variable("Rest0");
      patterns.push(
        `{ type: "bgp", triples: [${objectInitializer({
          subject: listVariable,
          predicate: rdfjsTermExpression(rdf.rest),
          object: rest0Variable,
        })}] }`,
      );
    }

    const optionalPatterns: string[] = [];

    const restNVariable = variable("RestN");
    // ?list rdf:rest+ ?restN
    optionalPatterns.push(
      `{ type: "bgp", triples: [${objectInitializer({
        subject: listVariable,
        predicate: `{ type: "path", pathType: "*", items: [${rdfjsTermExpression(rdf.rest)}] }`,
        object: restNVariable,
      })}] }`,
    );

    {
      // ?rest rdf:first ?itemN
      const itemNVariable = variable("ItemN");
      optionalPatterns.push(
        `{ type: "bgp", triples: [${objectInitializer({
          subject: restNVariable,
          predicate: rdfjsTermExpression(rdf.first),
          object: itemNVariable,
        })}] }`,
        ...this.itemType
          .sparqlWherePatterns({
            allowIgnoreRdfType: true,
            propertyPatterns: [],
            variables: {
              filter: variables.filter.map((filter) => `${filter}?.items`),
              preferredLanguages: variables.preferredLanguages,
              valueVariable: itemNVariable,
              variablePrefix: variablePrefix("ItemN"),
            },
          })
          .toArray(),
      );
    }

    // ?restN rdf:rest ?restNBasic to get the rdf:rest statement in the CONSTRUCT
    optionalPatterns.push(
      `{ type: "bgp", triples: [${objectInitializer({
        subject: restNVariable,
        predicate: rdfjsTermExpression(rdf.rest),
        object: variable("RestNBasic"),
      })}] }`,
    );

    patterns.push(
      `{ type: "optional", patterns: [${optionalPatterns.join(", ")}] }`,
    );

    // Having an optional around everything handles the rdf:nil case
    let result = new Type.SparqlWherePatterns(patterns, { type: "optional" });
    if (propertyPatterns.length > 0) {
      result = new Type.SparqlWherePatterns([
        ...propertyPatterns,
        ...result.toArray(),
      ]);
    }
    return result;
  }

  override toRdfExpression({
    variables,
  }: Parameters<Type["toRdfExpression"]>[0]): string {
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
    parameters: Parameters<Type["useImports"]>[0],
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
