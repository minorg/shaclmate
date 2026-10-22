import { ConsoleLogger } from "@rdfx/logger";
import { EitherAsync } from "purify-ts";
import {
  createExampleServiceHttpApi,
  type ExampleService,
  ForbiddenError,
  LoggingExampleService,
  PaymentRequiredError,
} from "./rest.shaclmate.js";

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
