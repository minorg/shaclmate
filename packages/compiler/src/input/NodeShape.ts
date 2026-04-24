import type { NamedNode } from "@rdfjs/types";
import type * as generated from "./generated.js";

export type NodeShape = generated.NodeShape &
  Readonly<{
    ancestorClassIris: readonly NamedNode[];
    childClassIris: readonly NamedNode[];
    descendantClassIris: readonly NamedNode[];
    isClass: boolean;
    isList: boolean;
    parentClassIris: readonly NamedNode[];
  }>;
