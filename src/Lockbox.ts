import { GetParametersCommand, Parameter, SSMClient } from '@aws-sdk/client-ssm';
import { ConfigLoader, ParameterConfig } from './ConfigLoader';
import { logger } from './logger';

interface LockboxConfig {
  region?: string;
  maxTries?: number;
  batchSize?: number;
  parameters?: ParameterConfig;
}

export class Lockbox {
  private readonly client: SSMClient;
  private readonly maxTries: number;
  private readonly batchSize: number;
  private readonly parameters: ParameterConfig;
  private isInitialized = false;

  private static readonly THROTTLING_ERRORS = [
    'ProvisionedThroughputExceededException',
    'Throttling',
    'ThrottlingException',
    'RequestLimitExceeded',
    'RequestThrottled',
    'TooManyRequestsException',
  ] as const;

  constructor(config: LockboxConfig = {}) {
    const { region = 'us-east-1', maxTries = 100, batchSize = 10, parameters } = config;

    this.client = new SSMClient({ region });
    this.maxTries = maxTries;
    this.batchSize = batchSize;

    // Load parameters from config file if not provided
    this.parameters = parameters || ConfigLoader.loadConfig();
  }

  /**
   * Initialize environment variables from SSM parameters
   */
  async init(): Promise<void> {
    try {
      if (!this.parameters.parameters) {
        throw new Error('No parameters to initialize');
      }

      const parameters = await this.getParameters(this.parameters.parameters);
      this.setEnvVariables(parameters);

      if (this.parameters.overrides) {
        this.setEnvVariables(this.parameters.overrides);
      }

      this.isInitialized = true;
    } catch (error) {
      logger.error('Failed to initialize parameters:', error);
      throw error;
    }
  }

  /**
   * Wait for initialization to complete
   */
  async waitForInit(maxWaitMs = 10000, checkIntervalMs = 100): Promise<void> {
    const startTime = Date.now();

    while (!this.isInitialized) {
      if (Date.now() - startTime > maxWaitMs) {
        throw new Error('Timeout waiting for parameter initialization');
      }
      await new Promise((resolve) => setTimeout(resolve, checkIntervalMs));
    }
  }

  private async getParameters(parameterNames: string[]): Promise<Parameter[]> {
    const chunks = this.chunkArray(parameterNames, this.batchSize);
    const parameterPromises = chunks.map((chunk) => this.getParameterChunkWithRetry(chunk));

    const responses = await Promise.all(parameterPromises);
    return responses.flat();
  }

  private async getParameterChunkWithRetry(names: string[], retryCount = 0): Promise<Parameter[]> {
    try {
      const command = new GetParametersCommand({
        Names: names,
        WithDecryption: true,
      });

      const response = await this.client.send(command);
      return response.Parameters ?? [];
    } catch (error) {
      if (this.isThrottlingError(error) && retryCount < this.maxTries) {
        const delayMs = Math.min(1000 * Math.pow(2, retryCount), 20000);
        logger.info(`Throttled, retry ${retryCount + 1}/${this.maxTries} after ${delayMs}ms`);

        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return this.getParameterChunkWithRetry(names, retryCount + 1);
      }

      throw error;
    }
  }

  private setEnvVariables(parameters: Parameter[]): void {
    const paramNames: string[] = [];
    for (const param of parameters) {
      paramNames.push(param.Name || '');
      if (param.Name && param.Value) {
        process.env[param.Name] = param.Value;
      }
    }
    if (paramNames.length > 0) {
      logger.info(`Set ${paramNames.join(', ')} environment variables`);
    }
  }

  private isThrottlingError(error: unknown): boolean {
    return error instanceof Error && 'name' in error && Lockbox.THROTTLING_ERRORS.includes(error.name as any);
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
