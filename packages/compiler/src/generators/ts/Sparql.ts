// Adapted from sparql.js (MIT license), substituting strings for RDF/JS term types so they can contain runtime variables

import { objectInitializer } from "./objectInitializer.js";

export namespace Sparql {
  type TypeScriptExpression = string;

  type BlankTerm = TypeScriptExpression;
  type IriTerm = TypeScriptExpression;
  // type LiteralTerm = TypeScriptExpression;
  type QuadTerm = TypeScriptExpression;
  type Term = TypeScriptExpression;
  type VariableTerm = TypeScriptExpression;

  type Expression = TypeScriptExpression;

  type PropertyPath = TypeScriptExpression;

  export type Pattern =
    | BgpPattern
    | BlockPattern
    | FilterPattern
    | BindPattern
    | ValuesPattern;
  // | SelectQuery;

  /**
   * Basic Graph Pattern
   */
  interface BgpPattern {
    readonly type: "bgp";
    readonly triples: Triple[];
  }

  type BlockPattern =
    | OptionalPattern
    | UnionPattern
    | GroupPattern
    | GraphPattern
    | MinusPattern
    | ServicePattern
    | OpaqueBlockPattern;

  interface OptionalPattern {
    readonly type: "optional";
    readonly patterns: readonly Pattern[];
  }

  interface UnionPattern {
    readonly type: "union";
    readonly patterns: readonly Pattern[];
  }

  interface GroupPattern {
    readonly type: "group";
    readonly patterns: readonly Pattern[];
  }

  interface GraphPattern {
    readonly type: "graph";
    readonly name: IriTerm | VariableTerm;
    readonly patterns: readonly Pattern[];
  }

  interface MinusPattern {
    readonly type: "minus";
    readonly patterns: readonly Pattern[];
  }

  interface ServicePattern {
    readonly type: "service";
    readonly name: IriTerm | VariableTerm;
    readonly silent: boolean;
    readonly patterns: readonly Pattern[];
  }

  interface FilterPattern {
    readonly type: "filter";
    readonly expression: Expression;
  }

  interface BindPattern {
    readonly type: "bind";
    readonly expression: Expression;
    readonly variable: VariableTerm;
  }

  interface ValuesPattern {
    readonly type: "values";
    readonly values: TypeScriptExpression; // ValuePatternRow[];
  }

  // interface ValuePatternRow {
  //   [variable: string]: IriTerm | BlankTerm | LiteralTerm | undefined;
  // }

  export interface Triple {
    readonly subject: IriTerm | BlankTerm | VariableTerm | QuadTerm;
    readonly predicate: IriTerm | VariableTerm | PropertyPath;
    readonly object: Term;
  }

  interface OpaqueBlockPattern {
    readonly patterns: TypeScriptExpression;
    readonly type: "opaque-block";
  }

  export namespace Triple {
    /**
     * Convert a triple to a string that can be used at runtime.
     *
     * Can't use JSON.stringify because the strings may actually be TypeScript expressions.
     */
    export function stringify(triple: Triple): string {
      return objectInitializer(triple);
    }
  }

  export namespace Pattern {
    /**
     * Convert a pattern to a string that can be used at runtime.
     *
     * Can't use JSON.stringify because the strings may actually be TypeScript expressions.
     */
    export function stringify(pattern: Pattern): string {
      switch (pattern.type) {
        case "bgp":
          return `{ triples: [${pattern.triples.map(({ object, predicate, subject }) => `{ object: ${object}, predicate: ${predicate}, subject: ${subject} }`)}], type: "${pattern.type}" }`;
        case "bind":
          return `{ expression: ${pattern.expression}, type: "${pattern.type}", variable: ${pattern.variable} }`;
        case "filter":
          return `{ expression: ${pattern.expression}, type: "${pattern.type}" }`;
        case "graph":
          return `{ patterns: [${pattern.patterns.map(stringify).join(", ")}], name: ${pattern.name}, type: "${pattern.type}" }`;
        case "group":
        case "minus":
        case "optional":
        case "union":
          return `{ patterns: [${pattern.patterns.map(stringify).join(", ")}], type: "${pattern.type}" }`;
        case "opaque-block":
          return `{ patterns: ${pattern.patterns}.concat(), type: "group" }`;
        case "service":
          return `{ patterns: [${pattern.patterns.map(stringify).join(", ")}], name: ${pattern.name}, silent: ${pattern.silent}, type: "${pattern.type}" }`;
        case "values":
          return `{ type: "${pattern.type}", values: ${pattern.values} }`;
      }
    }
  }
}
