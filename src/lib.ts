import { useEffect, useState } from "react";
export function useStored<T>(
  key: string,
  initial: T,
  valid: (x: unknown) => x is T,
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
      return valid(parsed) ? parsed : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Storage may be disabled. */
    }
  }, [key, value]);
  return [value, setValue] as const;
}
export const isStrings = (x: unknown): x is string[] =>
  Array.isArray(x) && x.every((v) => typeof v === "string");
export const isTheme = (x: unknown): x is "dark" | "light" =>
  x === "dark" || x === "light";
export const isBoolean = (x: unknown): x is boolean => typeof x === "boolean";
export function saveText(filename: string, text: string, type = "text/plain") {
  const url = URL.createObjectURL(
    new Blob([text], { type: `${type};charset=utf-8` }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
