// src/pages/index.tsx
import Playground from "@/components/Playground";
import React, { useEffect, useState, useRef } from "react";
import { EnterIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import { Button, Input } from "@/components/ui";
import Examples from "@/components/Examples";

type AutofillPhrasesType = {
  "Shopify Gallery": string;
  "Partner Marquee": string;
  "Rotating 3D Carousel": string;
  "FAQ Accordion": string;
};

export default function Home() {
  const [task, setTask] = useState("");
  const [placeholder, setPlaceholder] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Using useRef to hold the index variables
  const i = useRef(0);
  const j = useRef(0);

  const autofillPhrases: AutofillPhrasesType = {
    "Shopify Gallery": "Generate a polaroid gallery layout for products",
    "Partner Marquee": "Create an infinite scrolling marquee for my logos",
    "Rotating 3D Carousel": "Design a rotating 3D carousel for testimonials",
    "FAQ Accordion": "Implement a FAQ accordion section with search",
  };

  const phrases = [
    "A section to display 4 products from a collection....     ",
    "Implement a FAQ accordion section with search...     ",
    "Type your task here...     ",
    "Design a rotating 3D carousel for testimonials...     ",
    "Create an infinite scrolling marquee for my partner logos...     ",
    "Type your task here...     ",
  ];

  function sendRequest() {
    fetch("http://localhost:3002", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ task }),
    });
  }

  useEffect(() => {
    const speed = 60;
    const loop = setInterval(() => {
      if (isDeleting) {
        setPlaceholder((prev) => prev.substring(0, prev.length - 1));
        if (placeholder === "") {
          setIsDeleting(false);
          i.current = (i.current + 1) % phrases.length;
        }
      } else {
        setPlaceholder(phrases[i.current].substring(0, j.current + 1));
        j.current++;
        if (j.current === phrases[i.current].length) {
          setIsDeleting(true);
          j.current = 0;
        }
      }
    }, speed);

    return () => clearInterval(loop);
  }, [placeholder, isDeleting]);

  return (
    <main className="min-h-screen bg-background dark:bg-gradient-to-r dark:from-background dark:via-background dark:to-background text-foreground flex flex-col items-center">
      <section className="w-full max-w-screen-xl h-[40vh] mx-auto rounded-lg flex flex-col justify-center items-center p-4 md:p-0">
        <h1 className="text-2xl md:text-4xl mb-4 md:mb-6 font-extrabold">
          Shopify-v0
        </h1>
        <div className="relative w-full md:w-1/2 flex mb-4">
          <Input
            type="text"
            className="text-lg flex-grow p-6 md:p-6 rounded-full bg-input text-foreground focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-primary"
            placeholder={placeholder}
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
        <div className="flex flex-col md:flex-row justify-center items-center mt-2 w-full md:w-2/3">
          <h3 className="text-xs md:text-sm font-semibold mb-2 md:mb-0 md:mr-4 text-foreground">
            Need inspiration?
          </h3>
          <div className="flex flex-wrap justify-between gap-2">
            {Object.keys(autofillPhrases).map((name, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs hover:bg-primary dark:hover:bg-primary rounded-full mb-2 md:mb-0"
                onClick={() =>
                  setTask(autofillPhrases[name as keyof typeof autofillPhrases])
                }
              >
                {name}
                <EnterIcon width={16} height={16} className="ml-1 md:ml-2" />
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
        <div className="my-24 h-1 bg-input rounded-lg text-foreground text-center" />
        <div className="text-center my-10">
          <h2 className="text-xl mb-12 tracking-tight text-foreground">
            Generated Liquid Examples
          </h2>
          <Examples />
        </div>
      </div>
    </main>
  );
}
