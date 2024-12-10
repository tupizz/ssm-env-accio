import fs from "fs";
import path from "path";
import { logger } from "./logger";

export interface ParameterConfig {
  parameters: string[];
  overrides?: Array<{ Name: string; Value: string }>;
}

interface LockboxConfig {
  configPath?: string;
}

export class ConfigLoader {
  private static readonly DEFAULT_CONFIG_PATHS = [
    "lockbox", // Project root lockbox directory
    "config", // Project root config directory
    ".lockbox", // Hidden lockbox directory
    ".config", // Hidden config directory
  ];

  private static getLockboxConfig(): string[] {
    try {
      const lockboxConfigPath = path.join(process.cwd(), ".lockbox");
      if (fs.existsSync(lockboxConfigPath)) {
        const configContent = fs.readFileSync(lockboxConfigPath, "utf8");
        const config: LockboxConfig = JSON.parse(configContent);

        if (config.configPath) {
          return [config.configPath, ...this.DEFAULT_CONFIG_PATHS];
        }
      }
    } catch (error) {
      console.warn("Failed to read .lockbox config:", error);
    }
    return this.DEFAULT_CONFIG_PATHS;
  }

  static loadConfig(): ParameterConfig {
    const nodeEnv = process.env.NODE_ENV || 'dev';
    const configPaths = this.getLockboxConfig();

    for (const configDir of configPaths) {
      const basePath = path.join(process.cwd(), configDir);

      // Skip if directory doesn't exist
      if (!fs.existsSync(basePath)) {
        continue;
      }

      // Try environment-specific config first
      const envConfigPath = path.join(basePath, `${nodeEnv}.js`);
      if (fs.existsSync(envConfigPath)) {
        logger.info(`Loading environment-specific config from ${envConfigPath}`);
        return require(envConfigPath);
      }

      // Try environment-specific TypeScript config
      const envTsConfigPath = path.join(basePath, `${nodeEnv}.ts`);
      if (fs.existsSync(envTsConfigPath)) {
        logger.info(`Loading environment-specific TypeScript config from ${envTsConfigPath}`);
        return require(envTsConfigPath).default;
      }

      // Try default.js
      const defaultJsPath = path.join(basePath, "default.js");
      if (fs.existsSync(defaultJsPath)) {
        logger.info(`Loading default config from ${defaultJsPath}`);
        return require(defaultJsPath);
      }

      // Try default.ts
      const defaultTsPath = path.join(basePath, "default.ts");
      if (fs.existsSync(defaultTsPath)) {
        logger.info(`Loading default TypeScript config from ${defaultTsPath}`);
        return require(defaultTsPath).default;
      }
    }
    
    logger.error("No configuration file found. Create either a lockbox/default.js or lockbox/{NODE_ENV}.js file");

    throw new Error(
      "No configuration file found. Create either a lockbox/default.js or lockbox/{NODE_ENV}.js file"
    );
  }
}
