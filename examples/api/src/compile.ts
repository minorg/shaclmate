import { TsGenerator } from "@shaclmate/compiler";
import { shapesGraph } from "./shapesGraph.js";

process.stdout.write(
  shapesGraph.compile({ generator: new TsGenerator() }).unsafeCoerce(),
);
