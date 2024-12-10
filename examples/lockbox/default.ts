export default {
  parameters: ["API_ACCESS_TOKEN"],
  overrides: [
    {
      Name: "BASE_CONTENT_RESOURCE_URL",
      Value: "https://content.cloudfront.net",
    },
  ],
};
