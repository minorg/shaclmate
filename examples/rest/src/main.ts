import dataFactory from "@rdfx/data-factory";
import { ConsoleLogger } from "@rdfx/logger";
import { Either } from "purify-ts";
import { LoggingExampleService } from "./rest-decorators.shaclmate.js";
import { createExampleServiceHttpApi } from "./rest-http-api.shaclmate.js";
import type { ExampleService } from "./rest-types.shaclmate.js";

const logger = new ConsoleLogger("info");

const service: ExampleService = new LoggingExampleService({
  delegate: {
    async get(parameters) {
      return Either.of({
        $identifier: () => dataFactory.blankNode(),
        result: parameters.identifier.value,
      });
    },
  },
  logger,
});

const serviceHttpApi = createExampleServiceHttpApi(service, { logger });

// Export the Hono API as the default so bun run picks it up.
export default serviceHttpApi;
