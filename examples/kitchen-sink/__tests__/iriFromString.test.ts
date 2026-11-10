import namespace from "@rdfjs/namespace";
import { PrefixMap } from "@rdfx/collection";
import dataFactory from "@rdfx/data-factory";
import { describe, it } from "vitest";
import "@rdfx/testing";
import { $iriFromString } from "../src/kitchen-sink.shaclmate.js";

describe("iriFromString", () => {
  const defaultNamespace = namespace("http://example.com");
  const prefixMap = new PrefixMap(
    [
      ["", dataFactory.namedNode("http://example.org/")],
      ["ex", dataFactory.namedNode("http://example.org/")],
      ["http", dataFactory.namedNode("http://www.w3.org/2006/http#")],
    ],
    { factory: dataFactory },
  );

  it("empty string", ({ expect }) => {
    expect($iriFromString("")).toBeLeft();
  });

  it("blank string", ({ expect }) => {
    expect($iriFromString("  ")).toBeLeft();
  });

  describe("no scheme/prefix", () => {
    it("with default namespace", ({ expect }) => {
      expect(
        $iriFromString("test", { defaultNamespace }).unsafeCoerce(),
      ).toEqualRdfTerm(defaultNamespace("test"));
    });

    it("without default namespace", ({ expect }) => {
      expect($iriFromString("test")).toBeLeft();
    });
  });

  it("scheme/prefix with no path", ({ expect }) => {
    expect($iriFromString("urn:")).toBeLeft();
  });

  it("http:// IRI, ignore http scheme in prefix map", ({ expect }) => {
    expect(
      $iriFromString("http://other.com/test", {
        defaultNamespace,
        prefixMap,
      }).unsafeCoerce(),
    ).toEqualRdfTerm(dataFactory.namedNode("http://other.com/test"));
  });

  it("http:path without //, use prefix map", ({ expect }) => {
    expect(
      $iriFromString("http:test", {
        defaultNamespace,
        prefixMap,
      }).unsafeCoerce(),
    ).toEqualRdfTerm(dataFactory.namedNode("http://www.w3.org/2006/http#test"));
  });

  it("empty string ('') prefix in prefix map takes precedence over default namespace", ({
    expect,
  }) => {
    expect(
      $iriFromString(":test", {
        defaultNamespace,
        prefixMap,
      }).unsafeCoerce(),
    ).toEqualRdfTerm(dataFactory.namedNode("http://example.org/test"));
  });

  it("ex prefix in prefix map", ({ expect }) => {
    expect(
      $iriFromString("ex:test", {
        defaultNamespace,
        prefixMap,
      }).unsafeCoerce(),
    ).toEqualRdfTerm(dataFactory.namedNode("http://example.org/test"));
  });

  it("fall through to assume well-formed IRI", ({ expect }) => {
    expect(
      $iriFromString("http://example.net/test", {
        defaultNamespace,
        prefixMap,
      }).unsafeCoerce(),
    ).toEqualRdfTerm(dataFactory.namedNode("http://example.net/test"));
  });
});
