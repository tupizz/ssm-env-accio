import defaultConfig from './default';

export default {
  parameters: defaultConfig.parameters,
  overrides: [
    ...defaultConfig.overrides,
    {
      Name: 'INTERNAL_SERVER_API_URL',
      Value: 'https://dev.server.com/internal',
    },
    {
      Name: 'SERVER_API_URL',
      Value: 'https://dev.server.com',
    },
  ],
};
