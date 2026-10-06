import type { DatasetCore, NamedNode, Term } from "@rdfjs/types";
import { datasetFactory, type PrefixMap } from "@rdfx/collection";
import dataFactory from "@rdfx/data-factory";
import type { Curie } from "./Curie.js";
import { CurieFactory } from "./CurieFactory.js";

export function curieDataset(
  dataset: DatasetCore,
  prefixMap: PrefixMap,
): DatasetCore {
  let curieDataset: DatasetCore;
  const curieCache = new Map<string, Curie | NamedNode>();
  curieDataset = datasetFactory.dataset();
  const curieFactory = new CurieFactory({
    prefixMap,
  });

  const termToCurie = <TermT extends Term>(term: TermT): TermT => {
    if (term.termType !== "NamedNode") {
      return term;
    }
    const cachedCurie = curieCache.get(term.value);
    if (cachedCurie) {
      return cachedCurie as TermT;
    }
    const curie = curieFactory.create(term).extract() ?? term;
    curieCache.set(term.value, curie);
    return curie as TermT;
  };

  for (const quad of dataset) {
    const curieObject = termToCurie(quad.object);
    const curieSubject = termToCurie(quad.subject);

    if (
      !Object.is(curieObject, quad.object) ||
      !Object.is(curieSubject, quad.subject)
    ) {
      curieDataset.add(
        dataFactory.quad(curieSubject, quad.predicate, curieObject, quad.graph),
      );
    } else {
      curieDataset.add(quad);
    }
  }

  return curieDataset;
}
