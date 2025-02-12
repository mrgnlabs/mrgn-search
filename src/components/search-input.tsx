import React from "react";

import { IconSearch } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const SearchInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <Input
        {...props}
        ref={ref}
        className={cn("h-12 w-full pl-11 pr-4 md:text-lg", className)}
      />
      <IconSearch
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
});

SearchInput.displayName = "SearchInput";

export { SearchInput };
