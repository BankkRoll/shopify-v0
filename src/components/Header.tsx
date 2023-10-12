// src/components/Header.tsx
import React from "react";
import { Button, ModeToggle } from "./ui";
import Link from "next/link";

const Header: React.FC = () => {
  return (
    <div className="m-auto w-full max-w-screen-xl flex justify-between items-center p-4">
      <Button variant="link" className="text-foreground" asChild>
        <Link href="/">
          <h1 className="text-md font-extrabold">Shopify-v0</h1>
        </Link>
      </Button>
      <ModeToggle />
    </div>
  );
};

export default Header;
