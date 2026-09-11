#!/usr/bin/env npm exec tsx --

import { ConsoleLogger } from "@rdfx/logger";
import { TsGenerator } from "@shaclmate/compiler";
import { shapesGraph } from "./shapesGraph.js";

const logger = new ConsoleLogger();

process.stdout.write(
  shapesGraph
    .compile({
      generator: new TsGenerator({ logger }),
      logger,
    })
    .unsafeCoerce(),
);
