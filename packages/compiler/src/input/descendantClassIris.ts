import TermSet from "@rdfjs/term-set";
import type { NamedNode } from "@rdfjs/types";
import { rdfs } from "@tpluscode/rdf-ns-builders";
import type { Resource } from "rdfjs-resource";

export function descendantClassIris(
  classResource: Resource,
  maxDepth: number,
): readonly NamedNode[] {
  const descendantClassIris = new TermSet<NamedNode>();

  function descendantClassIrisRecursive(
    classResource: Resource,
    depth: number,
  ): void {
    for (const childClassValue of classResource.valuesOf(rdfs.subClassOf)) {
      childClassValue.toNamedResource().ifRight((childClassResource) => {
        if (descendantClassIris.has(childClassResource.identifier)) {
          return;
        }
        descendantClassIris.add(childClassResource.identifier);
        if (depth < maxDepth) {
          descendantClassIrisRecursive(childClassResource, depth + 1);
        }
      });
    }
  }

  descendantClassIrisRecursive(classResource, 1);

  return [...descendantClassIris];
}
