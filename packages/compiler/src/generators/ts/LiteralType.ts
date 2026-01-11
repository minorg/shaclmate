import { xsd } from "@tpluscode/rdf-ns-builders";
import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { Type } from "./Type.js";

export class LiteralType extends AbstractLiteralType {
  override readonly filterFunction = `${syntheticNamePrefix}filterLiteral`;
  override readonly filterType = new Type.CompositeFilterTypeReference(
    `${syntheticNamePrefix}LiteralFilter`,
  );

  get graphqlType(): Type.GraphqlType {
    throw new Error("not implemented");
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["fromJsonExpression"]>[0]): string {
    return `dataFactory.literal(${variables.value}["@value"], typeof ${variables.value}["@language"] !== "undefined" ? ${variables.value}["@language"] : (typeof ${variables.value}["@type"] !== "undefined" ? dataFactory.namedNode(${variables.value}["@type"]) : undefined))`;
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<AbstractLiteralType["hashStatements"]>[0]): readonly string[] {
    return [
      `${variables.hasher}.update(${variables.value}.datatype.value);`,
      `${variables.hasher}.update(${variables.value}.language);`,
    ].concat(super.hashStatements({ depth, variables }));
  }

  override jsonType(
    parameters?: Parameters<Type["jsonType"]>[0],
  ): Type.JsonType {
    const discriminantProperty = parameters?.includeDiscriminantProperty
      ? `, readonly termType: "Literal"`
      : "";
    return new Type.JsonType(
      `{ readonly "@language"?: string${discriminantProperty}, readonly "@type"?: string, readonly "@value": string }`,
    );
  }

  override jsonZodSchema({
    includeDiscriminantProperty,
    variables,
  }: Parameters<AbstractLiteralType["jsonZodSchema"]>[0]): ReturnType<
    AbstractLiteralType["jsonZodSchema"]
  > {
    const discriminantProperty = includeDiscriminantProperty
      ? `, termType: ${variables.zod}.literal("Literal")`
      : "";

    return `${variables.zod}.object({ "@language": ${variables.zod}.string().optional()${discriminantProperty}, "@type": ${variables.zod}.string().optional(), "@value": ${variables.zod}.string() })`;
  }

  override snippetDeclarations(
    parameters: Parameters<Type["snippetDeclarations"]>[0],
  ): Readonly<Record<string, string>> {
    return mergeSnippetDeclarations(
      super.snippetDeclarations(parameters),
      parameters.features.has("sparql") && this.languageIn.length > 0
        ? singleEntryRecord(
            `${syntheticNamePrefix}arrayIntersection`,
            `\
function ${syntheticNamePrefix}arrayIntersection<T>(left: readonly T[], right: readonly T[]): readonly T[] {
  if (left.length === 0) {
    return right;
  }
  if (right.length === 0) {
    return left;
  }

  const intersection = new Set<T>();
  if (left.length <= right.length) {
    const rightSet = new Set(right);
    for (const leftElement of left) {
      if (rightSet.has(leftElement)) {
        intersection.add(leftElement);
      }
    }
  } else {
    const leftSet = new Set(left);
    for (const rightElement of right) {
      if (leftSet.has(rightElement)) {
        intersection.add(rightElement);
      }  
    }
  }
  return [...intersection];
}`,
          )
        : {},
      singleEntryRecord(
        `${syntheticNamePrefix}filterLiteral`,
        `\
function ${syntheticNamePrefix}filterLiteral(filter: ${syntheticNamePrefix}LiteralFilter, value: rdfjs.Literal): boolean {
  if (typeof filter.in !== "undefined" && !filter.in.some(in_ => {
    if (typeof in_.datatype !== "undefined" && value.datatype !== in_.datatype) {
      return false;
    }

    if (typeof in_.language !== "undefined" && value.language !== in_.language) {
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

  if (typeof filter.valueIn !== "undefined" && !filter.valueIn.some(inValue => inValue.value === value.value)) {
    return false;
  }

  return true;
}`,
      ),
      singleEntryRecord(
        `${syntheticNamePrefix}LiteralFilter`,
        `\
interface ${syntheticNamePrefix}LiteralFilter {
  readonly datatypeIn?: readonly string[];
  readonly in?: readonly { readonly datatype?: string; readonly language?: string; readonly value?: string; }[];
  readonly languageIn?: readonly string[];
  readonly valueIn?: readonly string[];
}`,
      ),
    );
  }

  override toJsonExpression({
    includeDiscriminantProperty,
    variables,
  }: Parameters<AbstractLiteralType["toJsonExpression"]>[0]): string {
    return `{ "@language": ${variables.value}.language.length > 0 ? ${variables.value}.language : undefined${includeDiscriminantProperty ? `, "termType": "Literal" as const` : ""}, "@type": ${variables.value}.datatype.value !== "${xsd.string.value}" ? ${variables.value}.datatype.value : undefined, "@value": ${variables.value}.value }`;
  }
}
