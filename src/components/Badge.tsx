import "./Badge.css";

type BadgeProps = {
  type: "live" | "next" | "done" | "hadir" | "pic" | "complete" | "plus-one";
  children: React.ReactNode;
};

const withDot = new Set(["live", "hadir", "complete"]);
const clayOf: Record<BadgeProps["type"], string> = {
  live: "clay clay-accent",
  hadir: "clay clay-accent",
  pic: "clay clay-accent",
  "plus-one": "clay clay-accent",
  complete: "clay clay-dark",
  next: "",
  done: "",
};

/** Figma: Badge — pill, 28px tall. */
export function Badge({ type, children }: BadgeProps) {
  return (
    <span className={`badge badge--${type} ${clayOf[type]} t-p-h5-bold`}>
      {withDot.has(type) && <span className="badge__dot" />}
      <span>{children}</span>
    </span>
  );
}
