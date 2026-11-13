import { lines } from "./shared";

/** Una descripción con un renglón por idea, como la escribió la persona. */
export function Lines({
  text,
  className,
  lineClassName,
  bullet,
}: {
  text: string;
  className?: string;
  lineClassName?: string;
  bullet?: string;
}) {
  const items = lines(text);
  if (!items.length) return null;
  return (
    <div className={className}>
      {items.map((line, i) => (
        <p key={i} className={lineClassName}>
          {bullet ? `${bullet} ${line}` : line}
        </p>
      ))}
    </div>
  );
}
