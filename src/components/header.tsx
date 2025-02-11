"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { IconBrandGithub } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="flex items-center gap-8 p-4">
      <h1 className="shrink-0 text-2xl font-bold">
        <Link href="/">Marginfi Search</Link>
      </h1>
      <nav className="flex w-full items-center gap-2">
        <Link href="/">
          <Button
            variant="ghost"
            className={pathname === "/" ? "bg-muted" : ""}
          >
            Accounts
          </Button>
        </Link>
        <Link href="/banks">
          <Button
            variant="ghost"
            className={pathname === "/banks" ? "bg-muted" : ""}
          >
            Banks
          </Button>
        </Link>
        <Link
          href="https://github.com/mrgnlabs/marginfi-search"
          className="ml-auto flex"
        >
          <Button variant="secondary">
            <IconBrandGithub />
            Github
          </Button>
        </Link>
      </nav>
    </header>
  );
};

export { Header };
