interface StatusBadgeProps {
  color: "red" | "yellow" | "green";
  text: string;
}

export function StatusBadge({ color, text }: StatusBadgeProps) {
  const baseClasses =
    "inline-block text-xs font-semibold px-3 py-1 rounded-full";

  const colorClasses = {
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-800",
    green: "bg-green-100 text-green-700",
  };

  return (
    <span className={`${baseClasses} ${colorClasses[color]}`}>{text}</span>
  );
}
