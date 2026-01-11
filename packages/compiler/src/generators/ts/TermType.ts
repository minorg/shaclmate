import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractTermType } from "./AbstractTermType.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { Type } from "./Type.js";

/**
 * ConstantTermT is the type of sh:defaultValue, sh:hasValue, and sh:in.
 * RuntimeTermT is the type of values at runtime.
 *
 * The two are differentiated because identifiers can have BlankNode or NamedNode values at runtime but only NamedNode values for sh:defaultValue et al.
 */
export class TermType<
  ConstantTermT extends Literal | NamedNode = Literal | NamedNode,
  RuntimeTermT extends BlankNode | Literal | NamedNode =
    | BlankNode
    | Literal
    | NamedNode,
> extends AbstractTermType {
  override readonly filterFunction = `${syntheticNamePrefix}filterTerm`;
  override readonly filterType = new Type.CompositeFilterTypeReference(
    `${syntheticNamePrefix}TermFilter`,
  );

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

  override get graphqlType(): Type.GraphqlType {
    throw new Error("not implemented");
  }

  @Memoize()
  override jsonType(): Type.JsonType {
    return new Type.JsonType(
      `{ readonly "@id": string, readonly termType: ${[...this.nodeKinds]
        .filter((nodeKind) => nodeKind !== "Literal")
        .map((nodeKind) => `"${nodeKind}"`)
        .join(
          " | ",
        )} } | { readonly "@language"?: string, readonly "@type"?: string, readonly "@value": string, readonly termType: "Literal" }`,
    );
  }

  override fromJsonExpression({
    variables,
  }: Parameters<Type["fromJsonExpression"]>[0]): string {
    return [...this.nodeKinds].reduce((expression, nodeKind) => {
      let valueToNodeKind: string;
      switch (nodeKind) {
        case "BlankNode":
          valueToNodeKind = `dataFactory.blankNode(${variables.value}["@id"].substring(2))`;
          break;
        case "Literal":
          valueToNodeKind = `dataFactory.literal(${variables.value}["@value"], typeof ${variables.value}["@language"] !== "undefined" ? ${variables.value}["@language"] : (typeof ${variables.value}["@type"] !== "undefined" ? dataFactory.namedNode(${variables.value}["@type"]) : undefined))`;
          break;
        case "NamedNode":
          valueToNodeKind = `dataFactory.namedNode(${variables.value}["@id"])`;
          break;
        default:
          throw new RangeError(nodeKind);
      }
      return expression.length === 0
        ? valueToNodeKind
        : `((${variables.value}.termType === "${nodeKind}") ? (${valueToNodeKind}) : (${expression}))`;
    }, "");
  }

  override graphqlResolveExpression(
    _parameters: Parameters<Type["graphqlResolveExpression"]>[0],
  ): string {
    throw new Error("not implemented");
  }

  override jsonZodSchema({
    variables,
  }: Parameters<Type["jsonZodSchema"]>[0]): ReturnType<Type["jsonZodSchema"]> {
    return `${variables.zod}.discriminatedUnion("termType", [${[
      ...this.nodeKinds,
    ]
      .map((nodeKind) => {
        switch (nodeKind) {
          case "BlankNode":
          case "NamedNode":
            return `${variables.zod}.object({ "@id": ${variables.zod}.string().min(1), termType: ${variables.zod}.literal("${nodeKind}") })`;
          case "Literal":
            return `${variables.zod}.object({ "@language": ${variables.zod}.string().optional(), "@type": ${variables.zod}.string().optional(), "@value": ${variables.zod}.string(), termType: ${variables.zod}.literal("Literal") })`;
          default:
            throw new RangeError(nodeKind);
        }
      })
      .join(", ")}])`;
  }

  override snippetDeclarations(
    parameters: Parameters<Type["snippetDeclarations"]>[0],
  ): Readonly<Record<string, string>> {
    return mergeSnippetDeclarations(
      super.snippetDeclarations(parameters),
      singleEntryRecord(
        `${syntheticNamePrefix}TermFilter`,
        `\
interface ${syntheticNamePrefix}TermFilter {
  readonly datatypeIn?: readonly string[];
  readonly in?: readonly { readonly datatype?: string; readonly language?: string; readonly type?: string; readonly value?: string; }[];
  readonly languageIn?: readonly string[];
  readonly typeIn?: readonly ("BlankNode" | "Literal" | "NamedNode")[];
  readonly valueIn?: readonly string[];
}`,
      ),
      singleEntryRecord(
        `${syntheticNamePrefix}filterTerm`,
        `\
function ${syntheticNamePrefix}filterTerm(filter: ${syntheticNamePrefix}TermFilter, value: rdfjs.BlankNode | rdfjs.Literal | rdfjs.NamedNode): boolean {
  if (typeof filter.in !== "undefined" && !filter.in.some(in_ => {
    if (typeof in_.datatype !== "undefined" && value.datatype !== in_.datatype) {
      return false;
    }

    if (typeof in_.language !== "undefined" && value.language !== in_.language) {
      return false;
    }

    if (typeof in_.type !== "undefined" && value.termType !== in_.type) {
      return false;
    }

    if (typeof in_.value !== "undefined" && value.value !== in_.value) {
      return false;
    }

    return true;
  })) {
    return false;
  }

  if (typeof filter.datatypeIn !== "undefined" && !filter.datatypeIn.some(inDatatype => inDatatype === value.datatype)) {
    return false;
  }

  if (typeof filter.languageIn !== "undefined" && !filter.languageIn.some(inLanguage => inLanguage === value.language)) {
    return false;
  }

  if (typeof filter.typeIn !== "undefined" && !filter.typeIn.some(inType => inType === value.termType)) {
    return false;
  }

  if (typeof filter.valueIn !== "undefined" && !filter.valueIn.some(inValue => inValue.value === value.value)) {
    return false;
  }

  return true;
}`,
      ),
    );
  }

  override toJsonExpression({
    variables,
  }: Parameters<Type["toJsonExpression"]>[0]): string {
    return [...this.nodeKinds].reduce((expression, nodeKind) => {
      let valueToNodeKind: string;
      switch (nodeKind) {
        case "BlankNode":
          valueToNodeKind = `{ "@id": \`_:\${${variables.value}.value}\`, termType: "${nodeKind}" as const }`;
          break;
        case "Literal":
          valueToNodeKind = `{ "@language": ${variables.value}.language.length > 0 ? ${variables.value}.language : undefined, "@type": ${variables.value}.datatype.value !== "${xsd.string.value}" ? ${variables.value}.datatype.value : undefined, "@value": ${variables.value}.value, termType: "${nodeKind}" as const }`;
          break;
        case "NamedNode":
          valueToNodeKind = `{ "@id": ${variables.value}.value, termType: "${nodeKind}" as const }`;
          break;
        default:
          throw new RangeError(nodeKind);
      }
      return expression.length === 0
        ? valueToNodeKind
        : `(${variables.value}.termType === "${nodeKind}") ? ${valueToNodeKind} : ${expression}`;
    }, "");
  }
}
