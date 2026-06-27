import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import * as kitchenSink from "../src/index.js";
import { harnesses } from "./harnesses.js";

const snapshotsDirectoryPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "__snapshots__",
);

describe("toJson", () => {
  it("union properties", ({ expect }) => {
    expect(
      kitchenSink.UnionDiscriminantsStruct.toJson(
        harnesses.unionDiscriminantsStruct1.instance,
      ),
    ).toMatchFileSnapshot(
      path.join(
        snapshotsDirectoryPath,
        "toJson",
        "unionDiscriminantsStruct1.json",
      ),
    );

    expect(
      kitchenSink.UnionDiscriminantsStruct.toJson(
        harnesses.unionDiscriminantsStruct2.instance,
      ),
    ).toMatchFileSnapshot(
      path.join(
        snapshotsDirectoryPath,
        "toJson",
        "unionDiscriminantsStruct2.json",
      ),
    );
  });

  it("toJSON", ({ expect }) => {
    expect(JSON.stringify(harnesses.termsStruct.instance)).toMatchFileSnapshot(
      path.join(snapshotsDirectoryPath, "toJson", "toJSON.json"),
    );
  });

  // it("property order", ({ expect }) => {
  //   const jsonObject =
  //     harnesses.nodeShapeWithOrderedProperties.instance.toJson();
  //   expect([...Object.keys(jsonObject)]).toEqual([
  //     "@id",
  //     "type",
  //     "propertyC",
  //     "propertyB",
  //     "propertyA",
  //   ]);
  // });
});
