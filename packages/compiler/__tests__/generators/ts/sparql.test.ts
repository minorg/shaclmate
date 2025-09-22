import type { NamedNode, Quad } from "@rdfjs/types";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import N3, { DataFactory as dataFactory } from "n3";
import * as oxigraph from "oxigraph";
import { MutableResourceSet } from "rdfjs-resource";
import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";
import { quadsToTurtle } from "./quadsToTurtle.js";

describe("sparql", () => {
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

  it("runtime languageIn (unspecified)", ({ expect }) => {
    const dataset = new oxigraph.Store();
    const identifier = dataFactory.blankNode();
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.LanguageInPropertiesClass.$properties
          .languageInPropertiesLiteralProperty.identifier,
        dataFactory.literal("arvalue", "ar"),
      ),
    );
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.LanguageInPropertiesClass.$properties
          .languageInPropertiesLiteralProperty.identifier,
        dataFactory.literal("envalue", "en"),
      ),
    );

    const sparqlConstructQueryString =
      kitchenSink.LanguageInPropertiesClass.$sparqlConstructQueryString();
    const quads = dataset.query(sparqlConstructQueryString) as oxigraph.Quad[];
    expect(quads).toHaveLength(2);
  });

  it("runtime languageIn (specified)", ({ expect }) => {
    const dataset = new oxigraph.Store();
    const identifier = dataFactory.blankNode();
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.LanguageInPropertiesClass.$properties
          .languageInPropertiesLiteralProperty.identifier,
        dataFactory.literal("arvalue", "ar"),
      ),
    );
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.LanguageInPropertiesClass.$properties
          .languageInPropertiesLiteralProperty.identifier,
        dataFactory.literal("envalue", "en"),
      ),
    );

    const sparqlConstructQueryString =
      kitchenSink.LanguageInPropertiesClass.$sparqlConstructQueryString({
        languageIn: ["en"],
      });
    const quads = dataset.query(sparqlConstructQueryString) as oxigraph.Quad[];
    expect(quads).toHaveLength(1);
    expect((quads[0].object as oxigraph.Literal).value).toStrictEqual(
      "envalue",
    );
  });

  it("sh:languageIn", ({ expect }) => {
    const dataset = new oxigraph.Store();
    const identifier = dataFactory.blankNode();
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.LanguageInPropertiesClass.$properties
          .languageInPropertiesLanguageInProperty.identifier,
        dataFactory.literal("arvalue", "ar"),
      ),
    );
    // dataset.add(
    //   dataFactory.quad(
    //     identifier,
    //     kitchenSink.LanguageInPropertiesClass.$properties
    //       .languageInPropertiesLanguageInProperty.identifier,
    //     dataFactory.literal("frvalue", "fr"),
    //   ),
    // );
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.LanguageInPropertiesClass.$properties
          .languageInPropertiesLanguageInProperty.identifier,
        dataFactory.literal("envalue", "en"),
      ),
    );

    const sparqlConstructQueryString =
      kitchenSink.LanguageInPropertiesClass.$sparqlConstructQueryString();
    const quads = dataset.query(sparqlConstructQueryString) as oxigraph.Quad[];
    expect(quads).toHaveLength(1);
    expect((quads[0].object as oxigraph.Literal).value).toStrictEqual(
      "envalue",
    );
  });
});
