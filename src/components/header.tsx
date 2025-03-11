"use client";

import React from "react";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import {
  IconAddressBook,
  IconBuildingBank,
  IconBrandGithub,
  IconMenu2,
  IconCheck,
  IconChevronDown,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconMrgn } from "@/components/ui/icons";

const links = [
  {
    href: "/banks",
    label: "Search banks",
    icon: <IconBuildingBank />,
  },
  {
    href: "/addresses",
    label: "Common addresses",
    icon: <IconAddressBook />,
  },
  {
    href: "https://github.com/mrgnlabs/mrgn-search",
    label: "Github",
    icon: <IconBrandGithub />,
  },
];

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [accountDropdownOpen, setAccountDropdownOpen] = React.useState(false);

  return (
    <header className="flex items-center gap-8 p-4">
      <h1 className="shrink-0 text-2xl font-bold">
        <Link href="/" className="flex items-center gap-2">
          <IconMrgn size={36} />
        </Link>
      </h1>
      <nav className="hidden w-full items-center gap-2 md:flex">
        <DropdownMenu
          open={accountDropdownOpen}
          onOpenChange={setAccountDropdownOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "gap-2",
                (pathname === "/" || pathname === "/arena") && "bg-muted",
              )}
            >
              Search accounts
              <IconChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={() => {
                  router.push("/");
                }}
              >
                {pathname === "/" && <IconCheck size={16} />}
                marginfi accounts
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  router.push("/arena");
                }}
              >
                {pathname === "/arena" && <IconCheck size={16} />}
                arena accounts
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        {links.map((link, index) => (
          <Link
            href={link.href}
            key={index}
            className={cn(index === links.length - 1 && "ml-auto")}
          >
            <Button
              variant="ghost"
              className={cn(pathname === link.href && "bg-muted")}
            >
              {link.label === "Github" && link.icon}
              {link.label}
            </Button>
          </Link>
        ))}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="ml-auto md:hidden">
            <IconMenu2 />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader className="sr-only">
            <SheetTitle>Marginfi Search</SheetTitle>
            <SheetDescription>
              Search for marginfi accounts, banks, and addresses.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-8 grid gap-2 py-4">
            {links.map((link, index) => (
              <Link href={link.href} key={index} className="w-full">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    pathname === link.href && "bg-muted",
                  )}
                >
                  {link.icon}
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export { Header };
