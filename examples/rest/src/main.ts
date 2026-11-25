import { logger } from "./logger.js";
import { ExampleServiceHttpApi } from "./rest.shaclmate.js";
import { service } from "./service.js";

// Export the Hono API as the default so bun run picks it up.
export default ExampleServiceHttpApi.create(service, { logger });
