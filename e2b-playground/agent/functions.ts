// e2b-playground/agent/functions.ts
enum ShopifyFileType {
    Styles,
    HTML,
    JavaScript,
    Schema
  }
  
  interface IShopifyFunctionParameters {
    type: ShopifyFileType;
    code: string;
    description: string;
  }
  
  interface IShopifyFunction {
    name: string;
    parameters: IShopifyFunctionParameters;
  }

export const functions = [
  {
    name: 'insert_styles',
    description: 'Inserts advanced, responsive CSS styles into the Shopify theme.',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The advanced CSS code to be inserted.',
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'insert_html_liquid',
    description: 'Inserts advanced HTML and Liquid code into the Shopify theme.',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The advanced HTML and Liquid code to be inserted.',
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'insert_javascript',
    description: 'Inserts advanced JavaScript into the Shopify theme.',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The advanced JavaScript code to be inserted.',
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'insert_schema',
    description: 'Inserts advanced schema settings into the Shopify theme for more customization options.',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The advanced schema settings to be inserted.',
        },
      },
      required: ['code'],
    },
  },
];

