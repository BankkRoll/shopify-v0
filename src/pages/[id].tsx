// src/pages/[id].tsx
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Prism from 'prismjs';
import { promises as fs } from 'fs';
import path from 'path';
import { Liquid } from 'liquidjs';
import 'prismjs/themes/prism-tomorrow.css';

interface ExampleDetailProps {
  code: string;
  contextData: any;
}

interface Setting {
  id: string;
  default?: any;
}

interface Block {
  type: string;
  settings: Setting[];
}

interface Schema {
  settings: Setting[];
  blocks: Block[];
}

// Define getStaticPaths if you want to pre-render the pages
export async function getStaticPaths() {
  return {
    paths: [
      { params: { id: "1" } },
      { params: { id: "2" } },
      { params: { id: "3" } },
      // add other ids here
    ],
    fallback: false,
  };
}

// Fetch the code from the files using getStaticProps
export async function getStaticProps(context: {
  params: { id: string };
}): Promise<{ props: ExampleDetailProps }> {
  const id = context.params.id;
  const filePath = path.join(
    process.cwd(),
    "src/codeExamples",
    `example${id}.liquid`,
  );

  // Read the file asynchronously
  const code = await fs.readFile(filePath, "utf8");

  // Extract the schema JSON from the Liquid file
  const schemaMatch = code.match(/{% schema %}([\s\S]*?){% endschema %}/);
  let schema;
  let contextData: { [key: string]: any } = {};

  if (schemaMatch && schemaMatch[1]) {
    try {
      schema = JSON.parse(schemaMatch[1].trim());
      // Create a mock context based on the default values in the schema
      schema.settings.forEach((setting: Setting) => {
        contextData[setting.id] = setting.default ?? null;
      });
      schema.blocks.forEach((block: Block) => {
        contextData[block.type] = block.settings.reduce((settings: { [key: string]: any }, setting: Setting) => {
          settings[setting.id] = setting.default ?? null;
          return settings;
        }, {});
      });
    } catch (error) {
      console.error('Failed to parse schema from Liquid template:', error);
      // Return empty object with null values if parsing fails
      contextData = {};
    }
  }

  // Remove the schema from the code to avoid rendering it
  const cleanedCode = code.replace(/{%[\s-]*schema[\s-]*%}[\s\S]*?{%[\s-]*endschema[\s-]*%}/g, '');

  return {
    props: {
      code: cleanedCode,
      contextData,
    },
  };
}

const ExampleDetail: React.FC<ExampleDetailProps> = ({ code, contextData }) => {
  const { id } = useRouter().query;
  const [isCopied, setIsCopied] = useState(false);
  const [renderedContent, setRenderedContent] = useState('');
  const [renderError, setRenderError] = useState<string | null>(null);

  // Instantiate the Liquid engine
  const engine = new Liquid({
    // Add any engine options here if needed
  });

// Function to preprocess the code by replacing custom Liquid tags with HTML tags
const preprocessCode = async (code: string) => {
  // Define a custom tag to handle Shopify's 'form' tag
  engine.registerTag('form', {
    parse: function(tagToken, remainTokens) {
      this.str = tagToken.args; // Get the arguments
      const stream = this.liquid.parser.parseStream(remainTokens);
      this.templates = [];
      stream
        .on('tag:endform', () => stream.stop())
        .on('template', tpl => this.templates.push(tpl))
        .on('end', () => {
          throw new Error("tag 'form' not closed");
        });
      stream.start();
    },
    render: async function(ctx, emitter) {
      // Here, we need to ensure the string is treated as attributes, not as a Liquid expression
      const str = this.str;
      emitter.write(`<form ${str}>`);
      const html = await this.liquid.renderer.renderTemplates(this.templates, ctx);
      emitter.write(html);
      emitter.write('</form>');
    }
  });

  // Replace Liquid-style style tags with regular HTML style tags
  code = code
    .replace(/{%-?\s*style\s*-?%}/g, '<style>')
    .replace(/{%-?\s*endstyle\s*-?%}/g, '</style>');

  // Process the custom 'form' tag
  try {
    code = await engine.parseAndRender(code, {});
  } catch (error) {
    console.error('Error processing custom form tag:', error);
  }

  return code;
};

// Function to render Liquid to HTML
const renderLiquidToHtml = async (liquidCode: string) => {
  try {
    const preprocessedCode = await preprocessCode(liquidCode);
    console.log("Code preprocessing succeeded.");
    const html = await engine.parseAndRender(preprocessedCode, contextData);
    console.log("HTML rendering succeeded.");
    setRenderedContent(html);
    setRenderError(null);
  } catch (error) {
    // Simplified error logging
    if (error instanceof Error) {
      console.error('Rendering error:', error.message);
      setRenderError(`Rendering error: ${error.message}`);
    } else {
      console.error('Unknown rendering error:', error);
      setRenderError('An unknown error occurred during rendering.');
    }
  }
};

useEffect(() => {
  console.log("Code changed, rendering...");
  renderLiquidToHtml(code);
}, [code]);

  useEffect(() => {
    Prism.highlightAll();
  }, [id]);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const exampleDetails = useMemo(() => ({
    "1": { title: "Contact Form", preview: "Preview 1" },
    "2": { title: "Featured Blocks", preview: "Preview 2" },
    "3": { title: "Polaroid Gallery", preview: "Preview 3" },
    // add more examples here
  }), []);

  const currentExample = useMemo(() => {
    return id ? exampleDetails[id as keyof typeof exampleDetails] : null;
  }, [id, exampleDetails]);

  if (!currentExample) return <div>Loading...</div>;

  if (renderError) {
    return <div className="error-message">We encountered a problem while rendering the template. Please try again later.</div>;
  }

  return (
    <div className="p-4 bg-background text-foreground m-auto max-w-screen-xl">
      <h1 className="text-2xl font-bold mb-4 text-foreground">
        {currentExample.title}
      </h1>

      <Tabs defaultValue="1">
        <TabsList className="mb-4 bg-muted text-muted-foreground">
          <TabsTrigger value="1">Live Preview</TabsTrigger>
          <TabsTrigger value="2">Live Code</TabsTrigger>
        </TabsList>

    <TabsContent value="1" className="bg-card text-card-foreground rounded-md">
      <div
        className="w-full h-[500px] bg-muted text-muted-foreground rounded-md overflow-auto"
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    </TabsContent>

        <TabsContent
          value="2"
          className="bg-card text-card-foreground rounded-md relative"
        >
          <button
            onClick={handleCopyClick}
            className="absolute top-2 right-2 bg-secondary-foreground text-secondary rounded px-2 py-1"
          >
            {isCopied ? "Copied" : "Copy"}
          </button>

          <pre className="bg-muted p-4 rounded-md text-card-foreground max-h-[600px] overflow-auto line-numbers">
            <code className="line-numbers language-javascript">{code}</code>
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExampleDetail;
