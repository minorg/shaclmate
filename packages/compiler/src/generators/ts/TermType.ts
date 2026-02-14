import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";

import { invariant } from "ts-invariant";
import { type Code, code, conditionalOutput, joinCode } from "ts-poet";
import { Memoize } from "typescript-memoize";

import { AbstractTermType } from "./AbstractTermType.js";
import { imports } from "./imports.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { sharedSnippets } from "./sharedSnippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class TermType<
  ConstantTermT extends Literal | NamedNode = Literal | NamedNode,
  RuntimeTermT extends BlankNode | Literal | NamedNode =
    | BlankNode
    | Literal
    | NamedNode,
> extends AbstractTermType {
  override readonly filterFunction = code`${sharedSnippets.filterTerm}`;
  override readonly filterType = code`${sharedSnippets.TermFilter}`;
  override readonly kind = "TermType";
  override readonly schemaType = code`${localSnippets.TermSchema}`;
  override readonly sparqlWherePatternsFunction =
    code`${localSnippets.termSparqlWherePatterns}`;

  constructor(
    superParameters: ConstructorParameters<
      typeof AbstractTermType<ConstantTermT, RuntimeTermT>
    >[0],
  ) {
    super(superParameters);
    invariant(
      this.nodeKinds.has("Literal") &&
        (this.nodeKinds.has("BlankNode") || this.nodeKinds.has("NamedNode")),
      "should be IdentifierType or LiteralType",
    );
  }

  override get graphqlType(): AbstractTermType.GraphqlType {
    throw new Error("not implemented");
  }

  @Memoize()
  override get name(): Code {
    return code`(${joinCode(
      [...this.nodeKinds].map((nodeKind) => (imports as any)[nodeKind]),
      { on: " | " },
    )})`;
  }

  @Memoize()
  get schema(): Code {
    return code`${this.schemaObject}`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      in: this.in_.length > 0 ? this.in_.map(rdfjsTermExpression) : undefined,
      nodeKinds: [...this.nodeKinds].map(
        (_) => `${JSON.stringify(_)} as const`,
      ),
    };
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractTermType["fromJsonExpression"]>[0]): Code {
    return [...this.nodeKinds].reduce(
      (expression, nodeKind) => {
        let valueToNodeKind: Code;
        switch (nodeKind) {
          case "BlankNode":
            valueToNodeKind = code`${imports.dataFactory}.blankNode(${variables.value}["@id"].substring(2))`;
            break;
          case "Literal":
            valueToNodeKind = code`${imports.dataFactory}.literal(${variables.value}["@value"], typeof ${variables.value}["@language"] !== "undefined" ? ${variables.value}["@language"] : (typeof ${variables.value}["@type"] !== "undefined" ? ${imports.dataFactory}.namedNode(${variables.value}["@type"]) : undefined))`;
            break;
          case "NamedNode":
            valueToNodeKind = code`${imports.dataFactory}.namedNode(${variables.value}["@id"])`;
            break;
          default:
            throw new RangeError(nodeKind);
        }
        return expression == null
          ? valueToNodeKind
          : code`((${variables.value}.termType === "${nodeKind}") ? (${valueToNodeKind}) : (${expression}))`;
      },
      null as Code | null,
    )!;
  }

  override graphqlResolveExpression(
    _parameters: Parameters<AbstractTermType["graphqlResolveExpression"]>[0],
  ): Code {
    throw new Error("not implemented");
  }

  @Memoize()
  override jsonType(): AbstractTermType.JsonType {
    return new AbstractTermType.JsonType(
      code`{ readonly "@id": string, readonly termType: ${[...this.nodeKinds]
        .filter((nodeKind) => nodeKind !== "Literal")
        .map((nodeKind) => `"${nodeKind}"`)
        .join(
          " | ",
        )} } | { readonly "@language"?: string, readonly "@type"?: string, readonly "@value": string, readonly termType: "Literal" }`,
    );
  }

  override jsonZodSchema(
    _parameters: Parameters<AbstractTermType["jsonZodSchema"]>[0],
  ): Code {
    return code`${imports.z}.discriminatedUnion("termType", [${[
      ...this.nodeKinds,
    ]
      .map((nodeKind) => {
        switch (nodeKind) {
          case "BlankNode":
          case "NamedNode":
            return code`${imports.z}.object({ "@id": ${imports.z}.string().min(1), termType: ${imports.z}.literal("${nodeKind}") })`;
          case "Literal":
            return code`${imports.z}.object({ "@language": ${imports.z}.string().optional(), "@type": ${imports.z}.string().optional(), "@value": ${imports.z}.string(), termType: ${imports.z}.literal("Literal") })`;
          default:
            throw new RangeError(nodeKind);
        }
      })
      .join(", ")}])`;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractTermType["toJsonExpression"]>[0]): Code {
    return [...this.nodeKinds].reduce(
      (expression, nodeKind) => {
        let valueToNodeKind: Code;
        switch (nodeKind) {
          case "BlankNode":
            valueToNodeKind = code`{ "@id": \`_:\${${variables.value}.value}\`, termType: "${nodeKind}" as const }`;
            break;
          case "Literal":
            valueToNodeKind = code`{ "@language": ${variables.value}.language.length > 0 ? ${variables.value}.language : undefined, "@type": ${variables.value}.datatype.value !== "${xsd.string.value}" ? ${variables.value}.datatype.value : undefined, "@value": ${variables.value}.value, termType: "${nodeKind}" as const }`;
            break;
          case "NamedNode":
            valueToNodeKind = code`{ "@id": ${variables.value}.value, termType: "${nodeKind}" as const }`;
            break;
          default:
            throw new RangeError(nodeKind);
        }
        return expression === null
          ? valueToNodeKind
          : code`(${variables.value}.termType === "${nodeKind}") ? ${valueToNodeKind} : ${expression}`;
      },
      null as Code | null,
    )!;
  }
}

namespace localSnippets {
  export const TermSchema = conditionalOutput(
    `${syntheticNamePrefix}TermSchema`,
    code`\
interface ${syntheticNamePrefix}TermSchema {
  readonly in?: readonly (${imports.Literal} | ${imports.NamedNode})[];
  readonly kind: "TermType";
  readonly nodeKinds: readonly ("BlankNode" | "Literal" | "NamedNode")[],
}`,
  );

  export const termSparqlWherePatterns = conditionalOutput(
    `${syntheticNamePrefix}termSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}termSparqlWherePatterns: ${sharedSnippets.SparqlWherePatternsFunction}<${sharedSnippets.TermFilter}, ${TermSchema}> =
  (parameters) => ${sharedSnippets.termSchemaSparqlWherePatterns}({ filterPatterns: ${sharedSnippets.termFilterSparqlPatterns}(parameters), ...parameters })`,
  );
}
