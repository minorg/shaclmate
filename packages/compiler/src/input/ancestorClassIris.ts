import TermSet from "@rdfjs/term-set";
import type { NamedNode } from "@rdfjs/types";
import { rdfs } from "@tpluscode/rdf-ns-builders";
import type { Resource } from "rdfjs-resource";

export function ancestorClassIris(
  classResource: Resource,
  maxDepth: number,
): readonly NamedNode[] {
  const ancestorClassIris = new TermSet<NamedNode>();

  function ancestorClassIrisRecursive(
    classResource: Resource,
    depth: number,
  ): void {
    for (const parentClassValue of classResource.values(rdfs.subClassOf)) {
      parentClassValue.toResource().ifRight((parentClassResource) => {
        if (parentClassResource.identifier.termType !== "NamedNode") {
          return;
        }
        if (ancestorClassIris.has(parentClassResource.identifier)) {
          return;
        }
        ancestorClassIris.add(parentClassResource.identifier);
        if (depth < maxDepth) {
          ancestorClassIrisRecursive(parentClassResource, depth + 1);
        }
      });
    }
  }

  ancestorClassIrisRecursive(classResource, 1);

  return [...ancestorClassIris];
}
