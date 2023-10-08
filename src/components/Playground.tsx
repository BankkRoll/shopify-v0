// src/components/Playground.tsx
import { useEffect, useState } from 'react';
import { Session } from '@e2b/sdk';

const logger = {
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

function Playground() {
  const [playground, setPlayground] = useState<Session | null>(null);
  const [url, setURL] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  async function initPlayground() {
    setLoading(true);
    try {
      if (!process.env.NEXT_PUBLIC_E2B_API_KEY) {
        throw new Error('E2B API key not set');
      }

      const session = await Session.create({
        id: 'Nodejs',
        apiKey: process.env.NEXT_PUBLIC_E2B_API_KEY,
        logger,
      });

      const generateShopifyLiquidCode = async (session: Session) => {
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
        await session.filesystem.write(
          '/Users/bankk/Developer/shopify-v0/e2b-playground/template/dawn/sections/section.liquid',
          liquidCode
        );
      };

      await generateShopifyLiquidCode(session);

      setURL('https://' + session.getHostname(3000));
      setPlayground(session);
    } catch (error) {
      logger.error('Failed to initialize E2B session:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    initPlayground();
    return () => {
      playground?.close();
    };
  }, []);

  return (
    <div className="w-full h-[600px] bg-red-500 rounded-md bg-zinc-300 p-4">
      {loading ? (
        <p>Loading...</p>
      ) : (
        url && (
          <iframe
            className="w-full h-full rounded-md"
            src={url}
          />
        )
      )}
    </div>
  );
}

export default Playground;
