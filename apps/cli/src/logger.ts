import { pino } from "pino";

export const logger = pino({
  level:
    process.env["NODE_ENV"] === "development" ||
    process.env["NODE_ENV"] === "test"
      ? "debug"
      : "info",
  transport: {
    target: "pino-pretty",
    options: {
      destination: 2,
      colorize: true,
    },
  },
});
