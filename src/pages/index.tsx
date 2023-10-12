// src/pages/index.tsx
import Playground from "@/components/Playground";
import React, { useState } from "react";
import { EnterIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import { Button, Input, ModeToggle } from "@/components/ui";

type AutofillPhrasesType = {
  "Shopify Gallery": string;
  "Partner Marquee": string;
  "Rotating 3D Carousel": string;
  "FAQ Accordion": string;
};

export default function Home() {
  const [task, setTask] = useState("");

  const autofillPhrases: AutofillPhrasesType = {
    "Shopify Gallery": "Generate a polaroid gallery layout for products",
    "Partner Marquee":
      "Create an infinite scrolling marquee for my partner logos",
    "Rotating 3D Carousel": "Design a rotating 3D carousel for testimonials",
    "FAQ Accordion": "Implement a FAQ accordion section with search",
  };

  function sendRequest() {
    fetch("http://localhost:3002", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ task }),
    });
  }

  return (
    <main className="min-h-screen bg-background dark:bg-gradient-to-r dark:from-background dark:via-background dark:to-background text-foreground flex flex-col items-center">
      <header className="w-full max-w-screen-xl flex justify-between items-center p-4">
        <Button variant="link" className="text-foreground">
          <h1 className="text-md font-extrabold">Shopify-v0</h1>
        </Button>
        <ModeToggle />
      </header>
      <section className="w-full max-w-screen-xl h-[40vh] m-auto rounded-lg flex flex-col justify-center items-center">
        <h1 className="text-4xl mb-6 font-extrabold">Shopify-v0</h1>
        <div className="relative w-1/2 flex mb-4">
          <Input
            type="text"
            className="text-lg flex-grow p-6 rounded-full bg-input text-foreground focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-primary"
            placeholder="A section to display 4 products from a collection..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
          <div className="absolute inset-y-0 right-2 flex items-center">
            <Button
              className="p-2 rounded-full bg-gradient-to-r from-primary to-secondary dark:from-primary-dark dark:to-secondary-dark hover:from-primary/70 hover:to-secondary/70 dark:hover:from-primary-dark/70 dark:hover:to-secondary-dark/70 focus:from-primary focus:to-secondary focus:ring focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all ease-in-out duration-300"
              onClick={sendRequest}
            >
              <PaperPlaneIcon width={20} height={20} />
            </Button>
          </div>
        </div>
        <div className="flex justify-center items-center mt-2 w-2/3">
          <h3 className="text-sm font-semibold mb-0 mr-4 text-foreground">
            Need inspiration?
          </h3>
          <div className="flex justify-between gap-x-2">
            {Object.keys(autofillPhrases).map((name, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs hover:bg-opacity-20 rounded-full"
                onClick={() =>
                  setTask(autofillPhrases[name as keyof typeof autofillPhrases])
                }
              >
                {name}
                <EnterIcon width={20} height={20} className="ml-2" />
              </Button>
            ))}
          </div>
        </div>
      </section>
      <div className="relative w-full max-w-screen-xl p-6 rounded-lg bg-background bg-opacity-30 dark:bg-background dark:bg-opacity-30 backdrop-blur-md">
        <div className="text-center mb-12">
          <h2 className="text-xl mb-2 tracking-tight text-foreground">
            Shopify Liquid Section Generator
          </h2>
        </div>
        <div className="w-full h-[600px] bg-black bg-opacity-60 dark:bg-background dark:bg-opacity-60 rounded-md backdrop-blur-md">
          <Playground />
        </div>
      </div>
    </main>
  );
}
