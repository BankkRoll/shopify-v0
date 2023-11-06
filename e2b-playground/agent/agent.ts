// e2b-playground/agent/agent.ts
import OpenAI from "openai";
import fs from "fs";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { functions } from "./functions";
import { Session } from "@e2b/sdk";


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const E2B_API_KEY = process.env.NEXT_PUBLIC_E2B_API_KEY;

const app = express();
app.use(cors());

interface IHistory {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
}

type LiquidComponents = {
  styles: string;
  html: string;
  javascript: string;
  schema: string;
};

const model: string = "gpt-3.5-turbo-16k";
// const model = 'gpt-4';
const systemPrompt: string = fs.readFileSync("./system_prompt.txt", "utf8");
const history: IHistory[] = [
  {
    role: "system",
    content: systemPrompt,
  },
  {
    role: "user",
    content:
      "Generate a advanced polaroid gallery layout for products. The layout should include styles, HTML, and schema settings.",
  },
  {
    role: "assistant",
    content: `{
        "code": "
        {%- style -%}
        .polaroid-gallery { padding: {{ section.settings.padding }}px; text-align: center; }
        .polaroid-item { 
          display: inline-block; 
          border: solid 10px #fff; background: #fff;
          box-shadow: 0 0 12px #555;
        }
        .polaroid-item img { max-width: 100%; }
        .polaroid-item:hover { top: -5px; }
        {%- endstyle -%}
        
        <div class="polaroid-gallery">
          <h2>{{ section.settings.title }}</h2>
          {% if section.blocks.size > 0 %}
            <ul>
              {% for block in section.blocks %}
                <li class="polaroid-item">
                  {% if block.settings.image != blank %}
                    <img src="{{ block.settings.image | img_url: '300x300', scale: 2 }}" alt="{{ block.settings.image.alt }}">
                  {% else %}
                    {{ 'logo' | placeholder_svg_tag: 'placeholder-svg' }}
                  {% endif %}
                  <span style="color: #000; font-size: 14px;">
                    {{ block.settings.caption }}
                  </span>
                </li>
              {% endfor %}
            </ul>
          {% endif %}
        </div>
        
        {% schema %}
        {
          "name": "Polaroid Gallery",
          "class": "index-section",
          "max_blocks": 10,
          "settings": [
            {
              "type": "text",
              "id": "title",
              "label": "Gallery Title",
              "default": "Polaroid Gallery"
            },
            {
              "type": "select",
              "id": "alignment",
              "label": "Alignment",
              "default": "center",
              "options": [
                {"label": "Left", "value": "left"},
                {"label": "Center", "value": "center"},
                {"label": "Right", "value": "right"}
              ]
            },
            {
              "type": "range",
              "id": "padding",
              "label": "Padding",
              "min": 0,
              "max": 100,
              "default": 25,
              "unit": "px"
            }
          ],
          "blocks": [
            {
              "type": "polaroid_image",
              "name": "Polaroid Image",
              "settings": [
                {
                  "type": "image_picker",
                  "id": "image",
                  "label": "Image"
                },
                {
                  "type": "text",
                  "id": "caption",
                  "label": "Caption",
                  "default": "Caption"
                }
              ]
            }
          ],
          "presets": [
            {
              "name": "Default Polaroid Gallery",
              "category": "Image",
              "blocks": [
                {
                  "type": "polaroid_image"
                },
                {
                  "type": "polaroid_image"
                },
                {
                  "type": "polaroid_image"
                },
                {
                  "type": "polaroid_image"
                }
              ]
            }
          ]
        }
        {% endschema %}
        "
      }`,
    name: "write_shopify_liquid",
  },
  {
    role: "assistant",
    content: `{ \"liquid\": \"section\" }`,
    name: "import_shopify_liquid",
  },
];

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

let errors: string = "";

function handleLiquidCode(components: LiquidComponents, componentName: string) {
  const { styles, html, javascript, schema } = components;

  return `
      {% comment %}
      --------------------------------------------------------------
          Section Name: ${componentName}.liquid
          Author: shopify-v0 https://github.com/BankkRoll/shopify-v0
          License: MIT
      --------------------------------------------------------------
      {% endcomment %}
    
      <!-- Shopify Liquid Page Generated by YourAssistant -->
    
      <!-- Styles -->
      <style>
      ${styles}
      </style>
    
      <!-- HTML and Liquid Markup -->
      ${html}
    
      <!-- JavaScript -->
      <script>
      ${javascript}
      </script>
    
      <!-- Schema -->
      ${schema}
    
      <!-- End of Shopify Liquid Page -->
    `;
}

async function run(userTask: string, componentName: string) {
  console.log('Starting session...');
  const session = await Session.create({
    id: 'Nodejs',
    apiKey: E2B_API_KEY,
  });

  history.push({
    role: "user",
    content: userTask,
  });

  let stream = await openai.chat.completions.create({
    model,
    messages: history,
    functions,
  });

  let choice = stream.choices[0];
  const liquidComponents: LiquidComponents = {
    styles: "",
    html: "",
    javascript: "",
    schema: "",
  };

  if (choice.finish_reason === "stop") {
    console.log("GPT has completed the task.");
  }

  while (choice.finish_reason !== "stop") {
    if (choice && choice.message && choice.message.function_call) {
      const functionName = choice.message.function_call.name;
      let functionsArgsStr = choice.message.function_call.arguments;

      functionsArgsStr = functionsArgsStr.trim().replace(/\n|\r/g, "");

      const functionArgs = JSON.parse(functionsArgsStr);

      switch (functionName) {
        case "insert_styles":
          liquidComponents.styles += functionArgs.code;
          break;
        case "insert_html_liquid":
          liquidComponents.html += functionArgs.code;
          break;
        case "insert_javascript":
          liquidComponents.javascript += functionArgs.code;
          break;
        case "insert_schema":
          liquidComponents.schema += functionArgs.code;
          break;
      }

      history.push({
        role: "assistant",
        name: functionName,
        content: functionsArgsStr,
      });

      if (errors) {
        history.push({
          role: "user",
          content: `I encountered the following error, please fix it:\n\`\`\`${errors}\`\`\``,
        });
      }

      if (errors || functionName === "import_shopify_assets") {
        errors = "";
        stream = await openai.chat.completions.create({
          model,
          messages: history,
          functions,
        });
        choice = stream.choices[0];
      } else {
        break;
      }
    }
  }
  const finalLiquidCode = handleLiquidCode(liquidComponents, componentName);

  // Directory checking and creation logic
  const dirPath = "e2b-playground/shopify-v0-template/dawn/sections";
  const filePath = `${dirPath}/section.liquid`;

  try {
    // Attempt to read the directory to check if it exists
    await session.filesystem.read(dirPath);
  } catch (error) {
    // If an error occurs, assume the directory doesn't exist and try to create it
    try {
      await session.filesystem.makeDir(dirPath);
      console.log(`Directory created at ${dirPath}`);
    } catch (mkdirError) {
      console.error(`Error creating directory at ${dirPath}:`, mkdirError);
      return; // Exit the function if directory creation fails
    }
  }

  // Proceed to write the file now that the directory is confirmed to exist
  try {
    await session.filesystem.write(filePath, finalLiquidCode);
    console.log(`Successfully wrote file to ${filePath}`);
  } catch (writeError) {
    console.error(`Error writing file to ${filePath}:`, writeError);
  }
}

app.post("/", async (req: Request, res: Response) => {
  const task: string = req.body.task;
  const componentName: string = req.body.componentName;
  await run(task, componentName);
  res.send("Success");
});

app.get("/", async (req: Request, res: Response) => {
  const session = await Session.create({
    id: 'Nodejs',
    apiKey: "e2b_8210ad33057d6fa224fbd0716b4fb1da43205f15",
  });
  const code = await session.filesystem.read("e2b-playground/shopify-v0-template/dawn/sections/section.liquid");
  res.json({ code });
});

app.listen(3001, async () => {
  try {
    const session = await Session.create({
      id: 'Nodejs',
      apiKey: "e2b_8210ad33057d6fa224fbd0716b4fb1da43205f15",
    });

    const proc = await session.process.start({
      cmd: 'git clone https://github.com/BankkRoll/shopify-v0-template.git e2b-playground/shopify-v0-template',
    });
    await proc.wait;

    const installShopifyCLI = await session.process.start({
      cmd: 'npm install -g shopify-cli',
    });
    await installShopifyCLI.wait;

    const shopifyDevServer = await session.process.start({
      cmd: 'shopify theme dev --store your-test-store.myshopify.com',
      cwd: 'e2b-playground/shopify-v0-template/dawn',
    });
    await shopifyDevServer.wait;

    console.log("Server listening on port 3002!");
  } catch (error) {
    console.error("Failed to start server:", error);
  }
});