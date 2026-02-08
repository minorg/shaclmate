import { DataFactory } from "n3";
import { invariant } from "ts-invariant";
import { describe, it } from "vitest";
import { testData } from "./testData.js";

describe("PropertyPath", () => {
  function propertyShape(name: string) {
    return testData.propertyPaths.shapesGraph
      .propertyShapeByIdentifier(
        DataFactory.namedNode(`http://example.com/${name}`),
      )
      .unsafeCoerce();
  }

  function propertyPath(name: string) {
    return propertyShape(`${name}PropertyShape`).path;
  }

  it("alternative path", ({ expect }) => {
    const propertyPath_ = propertyPath("AlternativePath");
    invariant(propertyPath_.$type === "AlternativePath");
    expect(propertyPath_.members).toHaveLength(2);
    for (let memberI = 0; memberI < 2; memberI++) {
      const member = propertyPath_.members[memberI];
      invariant(member.$type === "PredicatePath");
      expect(member.iri.value).toStrictEqual(
        `http://example.com/predicate${memberI + 1}`,
      );
    }
  });

  it("alternative inverse path", ({ expect }) => {
    const propertyPath_ = propertyPath("AlternativeInversePath");
    invariant(propertyPath_.$type === "AlternativePath");
    expect(propertyPath_.members).toHaveLength(2);
    for (let memberI = 0; memberI < 2; memberI++) {
      const member = propertyPath_.members[memberI];
      invariant(member.$type === "InversePath");
      invariant(member.path.$type === "PredicatePath");
      expect(member.path.iri.value).toStrictEqual(
        `http://example.com/predicate${memberI + 1}`,
      );
    }
  });

  it("inverse path", ({ expect }) => {
    const propertyPath_ = propertyPath("InversePath");
    invariant(propertyPath_.$type === "InversePath");
    invariant(propertyPath_.path.$type === "PredicatePath");
    expect(propertyPath_.path.iri.value).toStrictEqual(
      "http://example.com/predicate",
    );
  });

  it("one or more path", ({ expect }) => {
    const propertyPath_ = propertyPath("OneOrMorePath");
    invariant(propertyPath_.$type === "OneOrMorePath");
    invariant(propertyPath_.path.$type === "PredicatePath");
    expect(propertyPath_.path.iri.value).toStrictEqual(
      "http://example.com/predicate",
    );
  });

  it("predicate path", ({ expect }) => {
    const propertyPath_ = propertyPath("PredicatePath");
    invariant(propertyPath_.$type === "PredicatePath");
    expect(propertyPath_.iri.value).toStrictEqual(
      "http://example.com/predicate",
    );
  });

  it("sequence path", ({ expect }) => {
    const propertyPath_ = propertyPath("SequencePath");
    invariant(propertyPath_.$type === "SequencePath");
    expect(propertyPath_.members).toHaveLength(2);
    for (let memberI = 0; memberI < 2; memberI++) {
      const member = propertyPath_.members[memberI];
      invariant(member.$type === "PredicatePath");
      expect(member.iri.value).toStrictEqual(
        `http://example.com/predicate${memberI + 1}`,
      );
    }
  });

  it("zero or more path", ({ expect }) => {
    const propertyPath_ = propertyPath("ZeroOrMorePath");
    invariant(propertyPath_.$type === "ZeroOrMorePath");
    invariant(propertyPath_.path.$type === "PredicatePath");
    expect(propertyPath_.path.iri.value).toStrictEqual(
      "http://example.com/predicate",
    );
  });

  it("zero or one path", ({ expect }) => {
    const propertyPath_ = propertyPath("ZeroOrOnePath");
    invariant(propertyPath_.$type === "ZeroOrOnePath");
    invariant(propertyPath_.path.$type === "PredicatePath");
    expect(propertyPath_.path.iri.value).toStrictEqual(
      "http://example.com/predicate",
    );
  });
});
