// src/components/Playground.tsx
import { useEffect, useState } from "react";
import { Session } from "@e2b/sdk";

const logger = {
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

// Check E2B API key outside of the component to prevent multiple checks
if (!process.env.NEXT_PUBLIC_E2B_API_KEY) {
  throw new Error("E2B API key not set");
}

function Playground() {
  const [playground, setPlayground] = useState<Session | null>(null);
  const [url, setURL] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Helper function to recursively ensure that a directory exists
  const ensureDirectoryExists = async (session: Session, path: string) => {
    try {
      // Remove leading slashes and split the path
      const parts = path.replace(/^\//, "").split("/");
      let currentPath = "";

      for (const part of parts) {
        currentPath += `${part}/`;
        try {
          // Try to list the directory contents
          await session.filesystem.list(currentPath);
          logger.info(`Directory already exists: ${currentPath}`);
        } catch (error) {
          // If the directory does not exist, create it
          logger.info(`Creating directory: ${currentPath}`);
          await session.filesystem.makeDir(currentPath);
          // Confirm that the directory was created
          await session.filesystem.list(currentPath);
          logger.info(`Directory created successfully: ${currentPath}`);
        }
      }
    } catch (error) {
      logger.error(`Error ensuring directory exists: ${path}`, error);
      throw error;
    }
  };

  async function initPlayground() {
    setLoading(true);
    try {
      const session = await Session.create({
        id: "Nodejs",
        apiKey: process.env.NEXT_PUBLIC_E2B_API_KEY,
        logger,
      });

      const sectionsDir = "e2b-playground/shopify-v0-template/dawn/sections";

      // Ensure the sections directory exists
      await ensureDirectoryExists(session, sectionsDir);

      const filePath = `${sectionsDir}/section.liquid`;

      const liquidCode = `
        <style>
          .welcome-section {
            text-align: center;
            padding: 3rem 0;
          }
          .welcome-section h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
          }
          .welcome-section p {
            font-size: 1.2rem;
          }
        </style>

        <section class="welcome-section">
          <h1>{{ section.settings.welcome_title }}</h1>
          <p>{{ section.settings.welcome_instruction }}</p>
        </section>

        {% schema %}
          {
            "name": "Custom Welcome Section",
            "settings": [
              {
                "type": "text",
                "id": "welcome_title",
                "label": "Welcome Title",
                "default": "Welcome to Shopify-v0"
              },
              {
                "type": "text",
                "id": "welcome_instruction",
                "label": "Instruction",
                "default": "Get started by typing above to generate a custom section."
              }
            ]
          }
        {% endschema %}
      `;

      // Write the liquid code to the file
      await session.filesystem.write(filePath, liquidCode);

      setURL("https://" + session.getHostname(3000));
      setPlayground(session);
    } catch (error) {
      logger.error("Failed to initialize E2B session:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    initPlayground();
    // Cleanup function to close the session when the component is unmounted
    return () => {
      playground?.close();
    };
  }, []);

  return (
    <div className="w-full h-[600px] bg-secondary rounded-md p-4">
      {loading || !url ? (
        <div className="absolute inset-0 flex justify-center items-center">
          {loading ? (
            <div className="flex space-x-3">
              <div className="bg-foreground rounded-full h-3 w-3 animate-bounce"></div>
              <div className="bg-foreground rounded-full h-3 w-3 animate-bounce200"></div>
              <div className="bg-foreground rounded-full h-3 w-3 animate-bounce400"></div>
            </div>
          ) : (
            <p className="text-foreground">
              Sorry, unable to display playground.
            </p>
          )}
        </div>
      ) : null}

      {url && <iframe className="w-full h-full rounded-md" src={url} />}
    </div>
  );
}

export default Playground;
