import { useState, useEffect } from "react";
import { Box, Text } from "ink";

interface FooterProps {
  lastUpdated: Date | null;
  intervalMs: number;
}

export function Footer({ lastUpdated, intervalMs }: FooterProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  let countdown = "--:--";
  if (lastUpdated) {
    const elapsed = now - lastUpdated.getTime();
    const remaining = Math.max(0, intervalMs - elapsed);
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    countdown = `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  return (
    <Box
      flexDirection="row"
      justifyContent="space-between"
      paddingX={1}
      borderStyle="single"
      borderColor="gray"
      borderTop
      borderBottom={false}
      borderLeft={false}
      borderRight={false}
    >
      <Text>
        <Text inverse bold>
          {" "}r{" "}
        </Text>
        <Text> refresh  </Text>
        <Text inverse bold>
          {" "}q{" "}
        </Text>
        <Text> quit</Text>
      </Text>
      <Text dimColor>Next refresh in {countdown}</Text>
    </Box>
  );
}
