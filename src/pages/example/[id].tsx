import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import "prismjs/themes/prism-tomorrow.css";
import Prism from "prismjs";
import fs from "fs";
import path from "path";

interface ExampleDetailProps {
  code: string;
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
}): Promise<{ props: { code: string } }> {
  const id = context.params.id;
  const filePath = path.join(
    process.cwd(),
    "src/codeExamples",
    `example${id}.liquid`,
  );
  const code = fs.readFileSync(filePath, "utf8");

  return {
    props: {
      code,
    },
  };
}

const ExampleDetail: React.FC<ExampleDetailProps> = ({ code }) => {
  const router = useRouter();
  const { id } = router.query;
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const exampleDetails = {
    "1": { title: "Contact Form", preview: "Preview 1" },
    "2": { title: "Featured Blocks", preview: "Preview 2" },
    "3": { title: "Polaroid Gallery", preview: "Preview 3" },
  };

  const [currentExample, setCurrentExample] = useState<{
    title: string;
    preview: string;
  } | null>(null);

  useEffect(() => {
    if (id) {
      setCurrentExample(exampleDetails[id as keyof typeof exampleDetails]);
    }
    Prism.highlightAll();
  }, [id, currentExample]);

  if (!currentExample) return <div>Loading...</div>;

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

        <TabsContent
          value="1"
          className="bg-card text-card-foreground rounded-md"
        >
          <div className="w-full h-[500px] bg-muted text-muted-foreground rounded-md">
            {currentExample.preview}
          </div>
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
