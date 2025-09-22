import { fail } from "node:assert";
import type { NamedNode, Quad } from "@rdfjs/types";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import N3, { DataFactory as dataFactory } from "n3";
import * as oxigraph from "oxigraph";
import { MutableResourceSet } from "rdfjs-resource";
import { beforeAll, describe, it } from "vitest";
import { harnesses } from "./harnesses.js";
import { quadsToTurtle } from "./quadsToTurtle.js";

describe("sparql", () => {
  const languageInDataset = new oxigraph.Store();

  beforeAll(() => {
    const languageInSubject = oxigraph.blankNode();
    for (const language of ["", "ar", "en", "fr"]) {
      for (const property of Object.values(
        kitchenSink.LanguageInPropertiesClass.$properties,
      )) {
        languageInDataset.add(
          oxigraph.quad(
            languageInSubject,
            oxigraph.namedNode(property.identifier.value),
            language.length > 0
              ? oxigraph.literal(`${language}value`, language)
              : oxigraph.literal("value"),
          ),
        );
      }
    }
  });

  function queryLanguageInDataset(constructQuery: string): oxigraph.Store {
    // console.log(constructQuery);
    const constructResultQuads = languageInDataset.query(
      constructQuery,
    ) as oxigraph.Quad[];
    // console.log(constructResultQuads.length);
    constructResultQuads.sort((left, right) =>
      left.predicate.value.localeCompare(right.predicate.value),
    );
    const constructResultDataset = new oxigraph.Store();
    for (const quad of constructResultQuads) {
      constructResultDataset.add(quad);
      // console.log(quad.toString());
    }
    // console.log();
    // console.log(
    //   constructResultDataset.dump({
    //     format: "application/trig",
    //   }),
    // );
    return constructResultDataset;
  }

  for (const [id, harness] of Object.entries(harnesses)) {
    if (harness.instance.$identifier.termType !== "NamedNode") {
      continue;
    }

    it(`SPARQL: ${id}`, async ({ expect }) => {
      const toRdfDataset = harness.toRdf().dataset;
      const toRdfQuads: Quad[] = [];

      const oxigraphStore = new oxigraph.Store();
      for (const quad of toRdfDataset) {
        oxigraphStore.add(quad);
        toRdfQuads.push(quad);
      }

      const constructQueryString = harness.sparqlConstructQueryString();

      // Add to a Dataset to deduplicate the quads
      const constructResultDataset = new N3.Store(
        oxigraphStore.query(constructQueryString) as Quad[],
      );
      const constructInstance = harness
        .fromRdf(
          new MutableResourceSet({
            dataFactory,
            dataset: constructResultDataset,
          }).namedResource(harness.instance.$identifier as NamedNode),
          {
            extra: 1,
          },
        )
        .unsafeCoerce();
      const equalsResult = harness.equals(constructInstance as any).extract();
      if (equalsResult !== true) {
        const toRdfString = await quadsToTurtle(toRdfQuads);
        const constructResultString = await quadsToTurtle([
          ...constructResultDataset,
        ]);
        console.log("not equal:\n", toRdfString, "\n", constructResultString);
      }
      expect(equalsResult).toStrictEqual(true);
    });
  }

  it("languageIn unspecified", ({ expect }) => {
    const actualDataset = queryLanguageInDataset(
      kitchenSink.LanguageInPropertiesClass.$sparqlConstructQueryString(),
    );
    expect(actualDataset.size).toStrictEqual(6); // The sh:languageIn will exclude the lang="" and lang="ar"
  });

  it("languageIn: []", ({ expect }) => {
    const actualDataset = queryLanguageInDataset(
      kitchenSink.LanguageInPropertiesClass.$sparqlConstructQueryString({
        languageIn: [],
      }),
    );
    expect(actualDataset.size).toStrictEqual(6); // Same as not specifying languageIn
  });

  it("languageIn: ['en']", ({ expect }) => {
    const actualDataset = queryLanguageInDataset(
      kitchenSink.LanguageInPropertiesClass.$sparqlConstructQueryString({
        languageIn: ["en"],
      }),
    );
    expect(actualDataset.size).toStrictEqual(2);
    for (const quad of actualDataset.match()) {
      expect((quad.object as oxigraph.Literal).value).toStrictEqual("envalue");
    }
  });

  it("languageIn: ['']", ({ expect }) => {
    const actualDataset = queryLanguageInDataset(
      kitchenSink.LanguageInPropertiesClass.$sparqlConstructQueryString({
        languageIn: [""],
      }),
    );
    expect(actualDataset.size).toStrictEqual(2);
    for (const quad of actualDataset.match()) {
      expect((quad.object as oxigraph.Literal).value).toStrictEqual("value");
    }
  });

  it("languageIn: ['', 'en']", ({ expect }) => {
    const actualDataset = queryLanguageInDataset(
      kitchenSink.LanguageInPropertiesClass.$sparqlConstructQueryString({
        languageIn: ["", "en"],
      }),
    );
    expect(actualDataset.size).toStrictEqual(4);
    for (const quad of actualDataset.match()) {
      switch ((quad.object as oxigraph.Literal).value) {
        case "envalue":
        case "value":
          return;
        default:
          fail();
      }
    }
  });
});
