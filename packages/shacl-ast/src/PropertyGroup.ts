import type { BlankNode, NamedNode } from "@rdfjs/types";
import { Resource } from "rdfjs-resource";
import { Memoize } from "typescript-memoize";
import type * as generated from "./generated.js";

export class PropertyGroup {
  constructor(private readonly delegate: generated.ShaclCorePropertyGroup) {}

  get comments(): readonly string[] {
    return this.delegate.comments;
  }

  get identifier(): BlankNode | NamedNode {
    return this.delegate.$identifier;
  }

  get labels(): readonly string[] {
    return this.delegate.labels;
  }

  @Memoize()
  toString(): string {
    return `PropertyGroup(identifier=${Resource.Identifier.toString(this.identifier)})`;
  }
}
