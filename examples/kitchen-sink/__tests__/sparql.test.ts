import type { NamedNode, Quad } from "@rdfjs/types";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import N3, { DataFactory as dataFactory } from "n3";
import * as oxigraph from "oxigraph";
import {
  type MutableResource,
  MutableResourceSet,
  type Resource,
} from "rdfjs-resource";
import { beforeAll, describe, expect, it } from "vitest";
import { harnesses } from "./harnesses.js";
import { quadsToTurtle } from "./quadsToTurtle.js";

describe("sparql", () => {
  const languageInDataset = new oxigraph.Store();
  const validLanguageInLanguage = ["en", "fr"];

  beforeAll(() => {
    const languageInSubject = oxigraph.blankNode();
    for (const language of ["", "ar", "en", "fr"]) {
      for (const property of Object.values(
        kitchenSink.LanguageInPropertiesClass.$schema.properties,
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

  function queryInstances(
    constructQueryString: string,
    ...instances: readonly {
      $toRdf: (options?: {
        mutateGraph: MutableResource.MutateGraph;
        resourceSet: MutableResourceSet;
      }) => Resource;
    }[]
  ): kitchenSink.$RdfjsDatasetObjectSet {
    const oxigraphStore = new oxigraph.Store();
    for (const instance of instances) {
      for (const quad of instance.$toRdf().dataset) {
        oxigraphStore.add(quad);
      }
    }

    const resultDataset = new N3.Store(
      oxigraphStore.query(constructQueryString) as Quad[],
    );
    expect(resultDataset.size).not.toStrictEqual(0);
    // const resultDatasetTtl = quadsToTurtle(resultDataset);
    return new kitchenSink.$RdfjsDatasetObjectSet({
      dataset: resultDataset,
    });
  }

  for (const [id, harness] of Object.entries(harnesses)) {
    if (harness.instance.$identifier.termType !== "NamedNode") {
      continue;
    }

    it(`${id} round trip`, async ({ expect }) => {
      // if (id !== "unionDiscriminantsClass1") {
      //   return;
      // }

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
      const constructInstanceEither = harness.fromRdf(
        new MutableResourceSet({
          dataFactory,
          dataset: constructResultDataset,
        }).namedResource(harness.instance.$identifier as NamedNode),
        {
          context: {
            extra: 1,
          },
        },
      );
      if (constructInstanceEither.isRight()) {
        const constructInstance = constructInstanceEither.unsafeCoerce();
        const equalsResult = harness.equals(constructInstance as any).extract();
        expect(equalsResult).toStrictEqual(true);
        return;
      }
      const toRdfString = quadsToTurtle(toRdfQuads);
      const constructResultString = quadsToTurtle([...constructResultDataset]);
      console.log(
        "not equal:\nexpected:\n",
        toRdfString,
        "\nactual:\n",
        constructResultString,
      );
      console.log("query:\n", constructQueryString);
    });
  }

  it("filter: number in", ({ expect }) => {
    const actual = queryInstances(
      kitchenSink.TermPropertiesClass.$sparqlConstructQueryString({
        filter: {
          numberTermProperty: {
            in: [0],
          },
        },
      }),
      new kitchenSink.TermPropertiesClass({
        numberTermProperty: 1,
      }),
      new kitchenSink.TermPropertiesClass({
        numberTermProperty: 0,
      }),
    )
      .termPropertiesClassesSync()
      .unsafeCoerce();
    expect(actual).toHaveLength(1);
    expect(actual[0].numberTermProperty.extract()).toStrictEqual(0);
  });

  it("filter: number null", ({ expect }) => {
    const actual = queryInstances(
      kitchenSink.TermPropertiesClass.$sparqlConstructQueryString({
        filter: {
          numberTermProperty: null,
        },
      }),
      new kitchenSink.TermPropertiesClass({
        numberTermProperty: 1,
      }),
      new kitchenSink.TermPropertiesClass({
        numberTermProperty: 0,
      }),
      new kitchenSink.TermPropertiesClass({
        stringTermProperty: "test",
      }),
    )
      .termPropertiesClassesSync()
      .unsafeCoerce();
    expect(actual).toHaveLength(1);
    expect(actual[0].numberTermProperty.extract()).toBeUndefined();
    expect(actual[0].stringTermProperty.extract()).toStrictEqual("test");
  });

  it("filter: number non-null", ({ expect }) => {
    const actual = queryInstances(
      kitchenSink.TermPropertiesClass.$sparqlConstructQueryString({
        filter: {
          numberTermProperty: {},
        },
      }),
      new kitchenSink.TermPropertiesClass({
        stringTermProperty: "test1",
      }),
      new kitchenSink.TermPropertiesClass({
        numberTermProperty: 0,
      }),
      new kitchenSink.TermPropertiesClass({
        stringTermProperty: "test2",
      }),
    )
      .termPropertiesClassesSync()
      .unsafeCoerce();
    expect(actual).toHaveLength(1);
    expect(actual[0].numberTermProperty.extract()).toStrictEqual(0);
  });

  // it("filter: number range", ({ expect }) => {
  //   const actual = queryInstances(
  //     kitchenSink.TermPropertiesClass.$sparqlConstructQueryString({
  //       filter: {
  //         numberTermProperty: {
  //           item: {
  //             maxExclusive: 1,
  //             minInclusive: 0,
  //           },
  //         },
  //       },
  //     }),
  //     new kitchenSink.TermPropertiesClass({
  //       numberTermProperty: 1,
  //     }),
  //     new kitchenSink.TermPropertiesClass({
  //       numberTermProperty: 0,
  //     }),
  //   )
  //     .termPropertiesClassesSync()
  //     .unsafeCoerce();
  //   expect(actual).toHaveLength(1);
  //   expect(actual[0].numberTermProperty.extract()).toStrictEqual(0);
  // });

  // it("filter: string in", ({ expect }) => {
  //   const actual = queryInstances(
  //     kitchenSink.TermPropertiesClass.$sparqlConstructQueryString({
  //       filter: {
  //         stringTermProperty: {
  //           item: {
  //             in: ["test"],
  //           },
  //         },
  //       },
  //     }),
  //     new kitchenSink.TermPropertiesClass({
  //       stringTermProperty: "te",
  //     }),
  //     new kitchenSink.TermPropertiesClass({
  //       stringTermProperty: "test",
  //     }),
  //     new kitchenSink.TermPropertiesClass({
  //       stringTermProperty: "testx",
  //     }),
  //   )
  //     .termPropertiesClassesSync()
  //     .unsafeCoerce();
  //   expect(actual).toHaveLength(1);
  //   expect(actual[0].stringTermProperty.extract()).toStrictEqual("test");
  // });

  // it("filter: string lengths", ({ expect }) => {
  //   const actual = queryInstances(
  //     kitchenSink.TermPropertiesClass.$sparqlConstructQueryString({
  //       filter: {
  //         stringTermProperty: {
  //           item: {
  //             maxLength: 4,
  //             minLength: 3,
  //           },
  //         },
  //       },
  //     }),
  //     new kitchenSink.TermPropertiesClass({
  //       stringTermProperty: "te",
  //     }),
  //     new kitchenSink.TermPropertiesClass({
  //       stringTermProperty: "test",
  //     }),
  //     new kitchenSink.TermPropertiesClass({
  //       stringTermProperty: "testx",
  //     }),
  //   )
  //     .termPropertiesClassesSync()
  //     .unsafeCoerce();
  //   expect(actual).toHaveLength(1);
  //   expect(actual[0].stringTermProperty.extract()).toStrictEqual("test");
  // });

  it("preferredLanguages: unspecified", ({ expect }) => {
    const actualDataset = queryLanguageInDataset(
      kitchenSink.LanguageInPropertiesClass.$sparqlConstructQueryString(),
    );
    expect(actualDataset.size).toStrictEqual(validLanguageInLanguage.length);
  });

  it("preferredLanguages: []", ({ expect }) => {
    const actualDataset = queryLanguageInDataset(
      kitchenSink.LanguageInPropertiesClass.$sparqlConstructQueryString({
        preferredLanguages: [],
      }),
    );
    expect(actualDataset.size).toStrictEqual(validLanguageInLanguage.length);
  });

  it("preferredLanguages: ['en']", ({ expect }) => {
    const actualDataset = queryLanguageInDataset(
      kitchenSink.LanguageInPropertiesClass.$sparqlConstructQueryString({
        preferredLanguages: ["en"],
      }),
    );
    expect(actualDataset.size).toStrictEqual(
      Object.keys(kitchenSink.LanguageInPropertiesClass.$schema.properties)
        .length * 1,
    );
    for (const quad of actualDataset.match()) {
      expect((quad.object as oxigraph.Literal).value).toStrictEqual("envalue");
    }
  });
});
