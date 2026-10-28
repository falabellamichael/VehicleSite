import { useEffect, useRef, useState } from "react";
import { Check, ClipboardList, X } from "lucide-react";
import { findings, type Finding } from "./data";

export function useInspection(onSound: () => void) {
  const [found, setFound] = useState<string[]>([]);
  const [active, setActive] = useState<Finding | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  function inspect(finding: Finding) {
    window.clearTimeout(timer.current);
    setFound((current) =>
      current.includes(finding.id) ? current : [...current, finding.id],
    );
    setActive(finding);
    onSound();
    timer.current = window.setTimeout(() => setActive(null), 4600);
  }
  return {
    found,
    active,
    inspect,
    dismiss: () => {
      window.clearTimeout(timer.current);
      setActive(null);
    },
  };
}

export function InspectionTag({
  finding,
  dismiss,
}: {
  finding: Finding;
  dismiss: () => void;
}) {
  return (
    <aside
      className={`hg-tag ${finding.attention ? "needs-attention" : "checked"}`}
      key={finding.id}
      aria-label={`${finding.name} inspection note`}
    >
      <span className="hg-tag-hole" />
      <div className="hg-tag-top">
        <span>INSPECTION TAG</span>
        <button onClick={dismiss} aria-label="Close inspection tag">
          <X size={16} />
        </button>
      </div>
      <strong>{finding.name}</strong>
      <p>{finding.note}</p>
      <div className="hg-tag-bottom">
        <span>{finding.attention ? "ATTENTION" : "CHECKED"}</span>
        <span>TECH / HSG</span>
      </div>
    </aside>
  );
}

export function FindingsHook({ found }: { found: string[] }) {
  return (
    <details className="hg-findings">
      <summary>
        <ClipboardList size={17} />
        <span>YOUR FINDINGS</span>
        <b>{String(found.length).padStart(2, "0")}</b>
        <span className="sr-only"> of {findings.length}; expand to review</span>
      </summary>
      <div className="hg-findings-list">
        <strong>On the hook</strong>
        {found.length === 0 ? (
          <p>
            Hold the light on a marker, or select one, to collect a technician’s
            note.
          </p>
        ) : (
          <ul>
            {findings
              .filter((item) => found.includes(item.id))
              .map((item) => (
                <li key={item.id}>
                  <Check size={14} />
                  <span>
                    {item.name}
                    <small>{item.note}</small>
                  </span>
                </li>
              ))}
          </ul>
        )}
        <a href="#estimate">Take a look at the estimate ↗</a>
      </div>
    </details>
  );
}
