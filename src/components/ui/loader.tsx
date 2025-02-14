import { IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type LoaderProps = {
  text?: string;
  className?: string;
};

const Loader = ({ text = "Searching...", className }: LoaderProps) => {
  return (
    <div
      className={cn(
        "flex animate-pulse flex-col items-center justify-center gap-2 text-muted-foreground",
        className,
      )}
    >
      <IconLoader2 className="animate-spin" />
      {text}
    </div>
  );
};

export { Loader };
