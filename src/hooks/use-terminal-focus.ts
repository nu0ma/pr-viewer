import { useEffect, useRef } from "react";

/**
 * Detect terminal window focus using DEC mode 1004.
 * Calls `onFocus` when the terminal gains focus.
 * Supported by most modern terminals (iTerm2, kitty, alacritty, Windows Terminal, etc.).
 */
export function useTerminalFocus(onFocus: () => void) {
  const onFocusRef = useRef(onFocus);
  onFocusRef.current = onFocus;

  useEffect(() => {
    if (!process.stdin.isTTY) return;

    // Enable terminal focus reporting
    process.stdout.write("\x1b[?1004h");

    const onData = (data: Buffer) => {
      // \x1b[I = focus gained, \x1b[O = focus lost
      if (data.toString().includes("\x1b[I")) {
        onFocusRef.current();
      }
    };

    process.stdin.on("data", onData);

    return () => {
      process.stdout.write("\x1b[?1004l");
      process.stdin.off("data", onData);
    };
  }, []);
}
