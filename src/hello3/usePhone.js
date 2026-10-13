import { useEffect, useState } from "react";

// THE PHONE LAYOUT OF THE LANDING (Oct 2026, Agam: "don't need a collated list at the
// top; move the year, title and subtitles just below each project visual card"). At
// or under 720px the hero's project list is not rendered and each work card carries
// its own caption. Read synchronously on the first render, so the reveal (Hello.jsx),
// which measures the page once on mount, sees the phone layout from the start.
export const PHONE_QUERY = "(max-width: 720px)";
const match = () => typeof window !== "undefined" && !!window.matchMedia?.(PHONE_QUERY).matches;

export default function usePhone() {
  const [phone, setPhone] = useState(match);
  useEffect(() => {
    const mq = window.matchMedia?.(PHONE_QUERY);
    if (!mq) return undefined;
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return phone;
}
