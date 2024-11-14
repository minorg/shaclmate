import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { fromRdf } from "rdf-literal";
import { PrimitiveType } from "./PrimitiveType.js";
import type { Type } from "./Type";

export class BooleanType extends PrimitiveType {
  override get name(): string {
    return "boolean";
  }

  override defaultValueExpression(
    defaultValue: BlankNode | Literal | NamedNode,
  ): string {
    if (defaultValue.termType === "Literal") {
      try {
        const defaultValueExpression = fromRdf(defaultValue, true);
        if (typeof defaultValueExpression === "boolean") {
          return defaultValueExpression ? "true" : "false";
        }
      } catch {}
    }
    return "false";
  }

  override fromRdfResourceValueExpression({
    variables,
  }: Parameters<Type["fromRdfResourceValueExpression"]>[0]): string {
    return `${variables.resourceValue}.toBoolean()`;
  }

  override hashStatements({
    variables,
  }: Parameters<PrimitiveType["hashStatements"]>[0]): readonly string[] {
    return [`${variables.hasher}.update(${variables.value}.toString());`];
  }
}
