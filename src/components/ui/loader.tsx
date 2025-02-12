import { IconLoader2 } from "@tabler/icons-react";

type LoaderProps = {
  text?: string;
};

const Loader = ({ text = "Searching..." }: LoaderProps) => {
  return (
    <div className="flex animate-pulse flex-col items-center justify-center gap-2 text-muted-foreground">
      <IconLoader2 className="animate-spin" />
      {text}
    </div>
  );
};

export { Loader };
