"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  IconAddressBook,
  IconBuildingBank,
  IconBrandGithub,
  IconUser,
  IconMenu2,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/",
    label: "Search accounts",
    icon: <IconUser />,
  },
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
    href: "https://github.com/mrgnlabs/marginfi-search",
    label: "Github",
    icon: <IconBrandGithub />,
  },
];

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="flex items-center gap-8 p-4">
      <h1 className="shrink-0 text-2xl font-bold">
        <Link href="/" className="flex items-center gap-2">
          <svg
            width="35"
            height="35"
            fill="currentColor"
            viewBox="0 0 75 67"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M40.5038 0C40.5038 11.2992 40.5038 22.0269 40.5038 32.9584C51.9136 32.9584 63.12 32.9584 74.5 32.9584C74.5 44.3768 74.5 55.5915 74.5 67C63.1944 67 51.8342 67 40.1863 67C40.1863 56.153 40.1863 45.1967 40.1863 33.3311C38.2119 34.3348 36.6393 34.8366 35.4338 35.8006C32.1349 38.439 30.3143 42.0961 29.0493 46.0464C27.5611 50.7022 25.9439 55.2139 22.7094 59.0896C19.4651 62.9802 15.4766 65.3553 10.615 66.1354C7.33596 66.6621 3.97255 66.6373 0.5 66.8708C0.5 55.5518 0.5 44.66 0.5 33.6193C1.76996 33.346 3.03 33.1025 4.27516 32.7944C9.21113 31.5671 11.3095 27.5324 13.2244 23.448C15.3079 18.9959 16.8656 14.2755 19.1873 9.96255C22.3026 4.16887 27.6156 1.39128 34.0696 0.710546C36.0738 0.491916 38.0829 0.263349 40.5038 0Z"></path>
          </svg>
        </Link>
      </h1>
      <nav className="hidden w-full items-center gap-2 md:flex">
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
