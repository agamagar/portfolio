"use client";
import React, { useState, useEffect, useCallback } from "react";
import { TextFlippingBoard } from "@/components/ui/text-flipping-board";

// Default messages — used when no `messages` prop is passed. (The source demo
// shipped with joke strings; replaced with clean, on-theme lines.)
const DEFAULT_MESSAGES: string[] = [
  "AWAY",
  "NEGOTIATE \nYOUR FLIGHTS",
  "NOT JUST SEARCH \nNEGOTIATE",
  "ONE TAP \nA BETTER PRICE",
];

export default function TextFlippingBoardDemo({
  messages,
}: {
  messages?: string[];
}) {
  const list = messages && messages.length ? messages : DEFAULT_MESSAGES;
  const [msgIdx, setMsgIdx] = useState(0);

  const next = useCallback(
    () => setMsgIdx((i) => (i + 1) % list.length),
    [list.length],
  );

  useEffect(() => {
    setMsgIdx(0);
    if (list.length < 2) return; // single message: scramble once, then hold
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next, list.length]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8 py-20">
      <TextFlippingBoard text={list[msgIdx % list.length]} />
    </div>
  );
}
