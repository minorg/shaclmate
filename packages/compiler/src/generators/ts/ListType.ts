import type { NamedNode } from "@rdfjs/types";
import { rdf } from "@tpluscode/rdf-ns-builders";

import { Maybe } from "purify-ts";

import { Memoize } from "typescript-memoize";
import type {
  IdentifierMintingStrategy,
  TsFeature,
} from "../../enums/index.js";
import { Import } from "./Import.js";
import { SnippetDeclarations } from "./SnippetDeclarations.js";
import { Type } from "./Type.js";
import { objectInitializer } from "./objectInitializer.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class ListType extends Type {
  private readonly _mutable: boolean;
  private readonly identifierMintingStrategy: IdentifierMintingStrategy;
  private readonly identifierNodeKind: "BlankNode" | "NamedNode";
  private readonly toRdfTypes: readonly NamedNode[];

  readonly itemType: Type;
  readonly kind = "ListType";
  readonly typeof = "object";

  constructor({
    identifierNodeKind,
    itemType,
    identifierMintingStrategy,
    mutable,
    toRdfTypes,
    ...superParameters
  }: {
    identifierNodeKind: ListType["identifierNodeKind"];
    itemType: Type;
    identifierMintingStrategy: Maybe<IdentifierMintingStrategy>;
    mutable: boolean;
    toRdfTypes: readonly NamedNode[];
  } & ConstructorParameters<typeof Type>[0]) {
    super(superParameters);
    this.identifierNodeKind = identifierNodeKind;
    this.itemType = itemType;
    this.identifierMintingStrategy = identifierMintingStrategy.orDefault(
      identifierNodeKind === "BlankNode" ? "blankNode" : "sha256",
    );
    this._mutable = mutable;
    this.toRdfTypes = toRdfTypes;
  }

  @Memoize()
  override get conversions(): readonly Type.Conversion[] {
    return [
      {
        // Defensive copy
        conversionExpression: (value) =>
          `${value}${this.mutable ? ".concat()" : ""}`,
        // Array.isArray doesn't narrow correctly
        // sourceTypeCheckExpression: (value) => `Array.isArray(${value})`,
        sourceTypeCheckExpression: (value) => `typeof ${value} === "object"`,
        sourceTypeName: this.name,
      },
    ];
  }

  override get discriminatorProperty(): Maybe<Type.DiscriminatorProperty> {
    return Maybe.empty();
  }

  @Memoize()
  override get equalsFunction(): string {
    return `((left, right) => ${syntheticNamePrefix}arrayEquals(left, right, ${this.itemType.equalsFunction}))`;
  }

  @Memoize()
  override get graphqlName(): string {
    return `new graphql.GraphQLList(new graphql.GraphQLNonNull(${this.itemType.graphqlName}))`;
  }

  @Memoize()
  override get jsonName(): string {
    return `readonly (${this.itemType.jsonName})[]`;
  }

  override get mutable(): boolean {
    return this._mutable || this.itemType.mutable;
  }

  @Memoize()
  override get name(): string {
    return `${this._mutable ? "" : "readonly "}${this.itemType.name}[]`;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<Type["fromJsonExpression"]>[0]): string {
    return `${variables.value}.map(_item => (${this.itemType.fromJsonExpression({ variables: { value: "_item" } })}))`;
  }

  override fromRdfExpression({
    variables,
  }: Parameters<Type["fromRdfExpression"]>[0]): string {
    const chain: string[] = [variables.resourceValues];
    chain.push("head()");
    chain.push("chain(value => value.toList())");
    chain.push(
      `map(values => values.flatMap(_value => ${this.itemType.fromRdfExpression({ variables: { ...variables, resourceValues: "_value.toValues()" } })}.toMaybe().toList()))`,
    );
    return chain.join(".");
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<Type["hashStatements"]>[0]): readonly string[] {
    return [
      `for (const _element${depth} of ${variables.value}) { ${this.itemType.hashStatements({ depth: depth + 1, variables: { ...variables, value: `_element${depth}` } }).join("\n")} }`,
    ];
  }

  override jsonUiSchemaElement(
    parameters: Parameters<Type["jsonUiSchemaElement"]>[0],
  ): ReturnType<Type["jsonUiSchemaElement"]> {
    return this.itemType.jsonUiSchemaElement(parameters);
  }

  override jsonZodSchema(
    parameters: Parameters<Type["jsonZodSchema"]>[0],
  ): ReturnType<Type["jsonZodSchema"]> {
    return `${this.itemType.jsonZodSchema(parameters)}.array()`;
  }

  override snippetDeclarations(features: Set<TsFeature>): readonly string[] {
    const snippetDeclarations: string[] = this.itemType
      .snippetDeclarations(features)
      .concat();
    if (features.has("equals")) {
      snippetDeclarations.push(SnippetDeclarations.arrayEquals);
    }
    return snippetDeclarations;
  }

  override sparqlConstructTemplateTriples({
    variables,
    context,
  }: Parameters<Type["sparqlConstructTemplateTriples"]>[0]): readonly string[] {
    switch (context) {
      case "property":
        return super.sparqlConstructTemplateTriples({ context, variables });
      case "type": {
        const triples: string[] = [];
        const listVariable = variables.subject;
        const variable = (suffix: string) =>
          `${this.dataFactoryVariable}.variable!(\`\${${variables.variablePrefix}}${suffix}\`)`;
        const variablePrefix = (suffix: string) =>
          `\`\${${variables.variablePrefix}}${suffix}\``;

        {
          // ?list rdf:first ?item0
          const item0Variable = variable("Item0");
          triples.push(
            objectInitializer({
              subject: listVariable,
              predicate: this.rdfjsTermExpression(rdf.first),
              object: item0Variable,
            }),
            ...this.itemType.sparqlConstructTemplateTriples({
              context: "type",
              variables: {
                subject: item0Variable,
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
              predicate: this.rdfjsTermExpression(rdf.rest),
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
              predicate: this.rdfjsTermExpression(rdf.first),
              object: itemNVariable,
            }),
            ...this.itemType.sparqlConstructTemplateTriples({
              context: "type",
              variables: {
                subject: itemNVariable,
                variablePrefix: variablePrefix("ItemN"),
              },
            }),
          );
        }

        // ?restN rdf:rest ?restNBasic to get the rdf:rest statement in the CONSTRUCT
        triples.push(
          objectInitializer({
            subject: restNVariable,
            predicate: this.rdfjsTermExpression(rdf.rest),
            object: variable("RestNBasic"),
          }),
        );

        return triples;
      }
    }
  }

  override sparqlWherePatterns({
    variables,
    context,
  }: Parameters<Type["sparqlWherePatterns"]>[0]): readonly string[] {
    // Need to handle two cases:
    // (1) (?s, ?p, ?list) where ?list binds to rdf:nil
    // (2) (?s, ?p, ?list) (?list, rdf:first, "element") (?list, rdf:rest, rdf:nil) etc. where list binds to the head of a list
    // Case (2) is case (1) with OPTIONAL graph patterns to handle actual list elements.

    switch (context) {
      case "property":
        return super.sparqlWherePatterns({ context, variables });
      case "type": {
        const patterns: string[] = [];
        const listVariable = variables.subject;
        const variable = (suffix: string) =>
          `${this.dataFactoryVariable}.variable!(\`\${${variables.variablePrefix}}${suffix}\`)`;
        const variablePrefix = (suffix: string) =>
          `\`\${${variables.variablePrefix}}${suffix}\``;

        {
          // ?list rdf:first ?item0
          const item0Variable = variable("Item0");
          patterns.push(
            `{ type: "bgp", triples: [${objectInitializer({
              subject: listVariable,
              predicate: this.rdfjsTermExpression(rdf.first),
              object: item0Variable,
            })}] }`,
            ...this.itemType.sparqlWherePatterns({
              context: "type",
              variables: {
                subject: item0Variable,
                variablePrefix: variablePrefix("Item0"),
              },
            }),
          );
        }

        {
          // ?list rdf:rest ?rest0
          const rest0Variable = variable("Rest0");
          patterns.push(
            `{ type: "bgp", triples: [${objectInitializer({
              subject: listVariable,
              predicate: this.rdfjsTermExpression(rdf.rest),
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
            predicate: `{ type: "path", pathType: "*", items: [${this.rdfjsTermExpression(rdf.rest)}] }`,
            object: restNVariable,
          })}] }`,
        );

        {
          // ?rest rdf:first ?itemN
          const itemNVariable = variable("ItemN");
          optionalPatterns.push(
            `{ type: "bgp", triples: [${objectInitializer({
              subject: restNVariable,
              predicate: this.rdfjsTermExpression(rdf.first),
              object: itemNVariable,
            })}] }`,
            ...this.itemType.sparqlWherePatterns({
              context: "type",
              variables: {
                subject: itemNVariable,
                variablePrefix: variablePrefix("ItemN"),
              },
            }),
          );
        }

        // ?restN rdf:rest ?restNBasic to get the rdf:rest statement in the CONSTRUCT
        optionalPatterns.push(
          `{ type: "bgp", triples: [${objectInitializer({
            subject: restNVariable,
            predicate: this.rdfjsTermExpression(rdf.rest),
            object: variable("RestNBasic"),
          })}] }`,
        );

        patterns.push(
          `{ type: "optional", patterns: [${optionalPatterns.join(", ")}] }`,
        );

        // Having an optional around everything handles the rdf:nil case
        return [`{ type: "optional", patterns: [${patterns.join(", ")}] }`];
      }
    }
  }

  override toJsonExpression({
    variables,
  }: Parameters<Type["toJsonExpression"]>[0]): string {
    let expression = variables.value;
    const itemFromJsonExpression = this.itemType.fromJsonExpression({
      variables: { value: "_item" },
    });
    if (itemFromJsonExpression !== "_item") {
      expression = `${expression}.map(_item => (${itemFromJsonExpression}))`;
    }

    return `${variables.value}.map(_item => (${this.itemType.toJsonExpression({ variables: { value: "_item" } })}))`;
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
        (_hasher, _item) => {
          ${this.itemType.hashStatements({ depth: 0, variables: { hasher: "_hasher", value: "_item" } }).join("\n")}
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

    return `${variables.value}.length > 0 ? ${variables.value}.reduce(({ currentSubListResource, listResource }, item, itemIndex, list) => {
    if (itemIndex === 0) {
      currentSubListResource = listResource;
    } else {
      const newSubListResource = ${variables.resourceSet}.${resourceSetMethodName}(${subListIdentifier}, ${objectInitializer(
        {
          mutateGraph: variables.mutateGraph,
        },
      )});
      currentSubListResource!.add(dataFactory.namedNode("${rdf.rest.value}"), newSubListResource.identifier);
      currentSubListResource = newSubListResource;
    }
    
    ${this.toRdfTypes.map((rdfType) => `currentSubListResource.add(dataFactory.namedNode("${rdf.type.value}"), dataFactory.namedNode("${rdfType.value}"))`).join("\n")}
        
    currentSubListResource.add(dataFactory.namedNode("${rdf.first.value}"), ${this.itemType.toRdfExpression({ variables: { mutateGraph: variables.mutateGraph, predicate: `dataFactory.namedNode("${rdf.first.value}")`, resource: "currentSubListResource", resourceSet: variables.resourceSet, value: "item" } })});

    if (itemIndex + 1 === list.length) {
      currentSubListResource.add(dataFactory.namedNode("${rdf.rest.value}"), dataFactory.namedNode("${rdf.nil.value}"));
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
).listResource.identifier : dataFactory.namedNode("${rdf.nil.value}")`;
  }

  override useImports(features: Set<TsFeature>): readonly Import[] {
    const imports: Import[] = this.itemType.useImports(features).concat();
    if (features.has("hash") && this.identifierNodeKind === "NamedNode") {
      imports.push(Import.SHA256);
    }
    return imports;
  }
}
