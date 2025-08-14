import { DataFactory as dataFactory } from "n3";
import { describe, it } from "vitest";
import "./harnesses.js"; // Must be imported before kitchenSink
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { harnesses } from "./harnesses.js";

describe("identifier", () => {
  it("use a blank node if no minting strategy is specified and a blank node is allowed as an identifier", ({
    expect,
  }) => {
    expect(harnesses.blankClass.instance.identifier.termType).toStrictEqual(
      "BlankNode",
    );
  });

  it("don't mint an IRI if one is supplied", ({ expect }) => {
    expect(
      harnesses.sha256IriClassWithExplicitIdentifier.instance.identifier.equals(
        dataFactory.namedNode("http://example.com/instance"),
      ),
    ).toStrictEqual(true);
  });

  it("identifier prefix", ({ expect }) => {
    const instance = new kitchenSink.Sha256IriClass({
      identifierPrefix: "urn:othernamespace:",
      sha256IriProperty: "test",
    });
    expect(instance.identifier.value).toMatch(
      "urn:othernamespace:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    );
  });

  it("mint an IRI with SHA-256 if none is supplied", ({ expect }) => {
    const instance = new kitchenSink.Sha256IriClass({
      sha256IriProperty: "test",
    });
    expect(
      instance.identifier.equals(
        dataFactory.namedNode(
          "urn:shaclmate:Sha256Iri:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
        ),
      ),
    ).toStrictEqual(true);
  });

  it("mint an IRI with UUIDv4 if none is supplied", ({ expect }) => {
    const instance = harnesses.uuidv4IriClassWithoutExplicitIdentifier.instance;
    expect(instance.identifier.value).toMatch(
      /urn:shaclmate:UuidV4Iri:[0-9A-Fa-f]{8}-/,
    );
  });
});
