// src/components/examples.tsx
import React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardImage,
} from "@/components/ui/card";

const exampleData = [
  {
    id: "1",
    img: "/example.png",
    title: "Contact Form",
    description:
      "Advanced contact form with name, email, company, subject, phone, and up to five custom fields",
  },
  {
    id: "2",
    img: "/example.png",
    title: "Featured Blocks",
    description: "Interactive way to showcase featured products or items",
  },
  {
    id: "3",
    img: "/example.png",
    title: "Polaroid Gallery",
    description: "Interactive way to showcase images on your Shopify store",
  },
  // more examples here
];

const Examples: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {exampleData.map((example) => (
        <Link key={example.id} href={`/example/${example.id}`}>
          <Card className="cursor-pointer hover:shadow-lg hover:shadow-foreground transition duration-200">
            <CardImage src={example.img} alt={`${example.title} image`} />
            <CardHeader>
              <div className="flex justify-center">
                <CardTitle className="text-center">{example.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="line-clamp-3 hover:line-clamp-none">
                {example.description}
              </CardDescription>
            </CardContent>
            <CardFooter>{/* Add any footer content here */}</CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default Examples;
