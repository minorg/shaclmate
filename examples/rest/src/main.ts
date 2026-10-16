import { ConsoleLogger } from "@rdfx/logger";
import { EitherAsync } from "purify-ts";
import { LoggingExampleService } from "./rest-decorators.shaclmate.js";
import { createExampleServiceHttpApi } from "./rest-http-api.shaclmate.js";
import {
  type ExampleService,
  ForbiddenError,
  PaymentRequiredError,
} from "./rest-types.shaclmate.js";

const logger = new ConsoleLogger("info");

const service: ExampleService = new LoggingExampleService({
  delegate: {
    async get({ identifier }) {
      return EitherAsync(async ({ throwE }) => {
        switch (identifier.value) {
          case "http://example.com/ForbiddenError":
            throwE(ForbiddenError.createUnsafe({ message: "forbidden" }));
            break;
          case "http://example.com/PaymentRequiredError":
            throwE(
              PaymentRequiredError.createUnsafe({
                message: "payment required",
              }),
            );
            break;
        }

        return {
          result: identifier.value,
        };
      });
    },
  },
  logger,
});

const serviceHttpApi = createExampleServiceHttpApi(service, { logger });

// Export the Hono API as the default so bun run picks it up.
export default serviceHttpApi;
