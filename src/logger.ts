import { createLogger, format, Logger, transports } from "winston";

// Determine log level based on environment variable
// const isDebugMode = process.env.LIB_DEBUG === "true";
// const logLevel = isDebugMode ? "debug" : "warn";

const logger: Logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console({
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});

export { logger };
