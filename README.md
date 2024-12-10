# 🪄 SSM-ENV-ACCIO

_Summon all your environment variables on demand, it's magic!_ ✨

[![npm version](https://badge.fury.io/js/ssm-env-accio.svg)](https://badge.fury.io/js/ssm-env-accio)

## 🎯 What is this?

SSM-ENV-ACCIO is a magical tool that fetches your AWS SSM Parameters and transforms them into environment variables faster than you can say "Alohomora!" It's perfect for managing configuration across different environments without revealing your secrets.

## 🚀 Quick Start

```bash
npm install ssm-env-accio
```

### Basic Usage

```typescript
import { Lockbox } from "ssm-env-accio";
async function main() {
  const lockbox = new Lockbox();
  await lockbox.init();
  // Your secrets are now available in process.env!
  console.log(process.env.MY_SECRET);
}
```

## 🎨 Configuration

### 1. Create a `.lockbox` file in your project root:

```json
{
  "configPath": "examples/lockbox"
}
```

### 2. Set up your configuration files:

```bash
touch ./lockbox/dev.ts
touch ./lockbox/prod.ts
touch ./lockbox/default.ts
```

default.ts

```typescript
export default {
  parameters: ["API_ACCESS_TOKEN"], // this will be pulled from SSM
  overrides: [
    {
      Name: "BASE_CONTENT_RESOURCE_URL",
      Value: "https://content.cloudfront.net", // this will be used as the value for the environment variable
    },
  ],
};
```

dev.ts

```typescript
import defaultConfig from "./default";

export default {
  ...defaultConfig,
  overrides: [
    {
      Name: "INTERNAL_SERVER_API_URL",
      Value: "https://dev.server.com",
    },
  ],
};
```

## ⚙️ Advanced Configuration

```typescript
const lockbox = new Lockbox({
  region: "us-west-2", // AWS region (default: us-east-1)
  maxTries: 50, // Max retry attempts for throttled requests (default: 100)
  batchSize: 5, // Parameters per batch (default: 10)
});
```

### 🔍 Features

- 🚀 Automatic AWS SSM Parameter fetching
- 🔄 Smart retry mechanism for throttled requests
- 🌍 Environment-specific configurations
- ⚡️ Batch parameter fetching for better performance
- 🔐 Automatic decryption of SecureString parameters
- 🎯 Local overrides for development

## 📁 Directory Structure

The configuration loader will look for your config files in the following order:

1. Custom path specified in `.lockbox`
2. `lockbox/` directory
3. `config/` directory
4. `.lockbox/` directory
5. `.config/` directory

## 🌟 Environment Support

Configuration files are loaded based on `NODE_ENV`:

- `dev.ts` (or `.js`) for development
- `prod.ts` (or `.js`) for production
- `default.ts` (or `.js`) as fallback

## 🛠️ Development

```bash
npm install
npm run build
npm run test
```

### Run the example

```bash
NODE_ENV=dev npx ts-node examples/index.ts
```

## 📝 License

MIT

## 🧙‍♂️ Why "Accio"?

Because just like the summoning charm in Harry Potter, this package fetches your environment variables from AWS SSM with a flick of your wand (or keyboard)!

---

Made with ❤️ and a bit of magic ✨
