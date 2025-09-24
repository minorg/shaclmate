import type { Quad } from "@rdfjs/types";
import N3 from "n3";

export function quadsToTurtle(quads: readonly Quad[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new N3.Writer({ format: "text/turtle" });
    for (const quad of quads) {
      writer.addQuad(quad);
    }
    writer.end((error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}
