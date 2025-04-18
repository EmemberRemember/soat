import { Button } from "../controls/Button";

export default function ButtonRow({
  className,
  setProcess,
  buttons,
}: {
  className?: string;
  setProcess: (process: string) => void;
  buttons: { label: string; process: string; highlight: boolean }[];
}) {
  return (
    <ul className={`w-full max-w-2xl flex gap-x-2 mt-12` + className}>
      {buttons.map((button) => (
        <li key={button.label} className="flex-1">
          <Button
            size="full"
            highlight={button.highlight}
            onClick={() => setProcess(button.process)}
          >
            {button.label}
          </Button>
        </li>
      ))}
    </ul>
  );
}
