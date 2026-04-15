import { Box, Text } from "ink";

interface HeaderProps {
  username: string;
  lastUpdated: Date | null;
  intervalMinutes: number;
}

export function Header({ username, lastUpdated, intervalMinutes }: HeaderProps) {
  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString("ja-JP", { hour12: false })
    : "--:--:--";

  return (
    <Box
      flexDirection="row"
      justifyContent="space-between"
      paddingX={1}
      borderStyle="bold"
      borderColor="cyan"
    >
      <Text bold color="cyan">
        PR Watcher
      </Text>
      <Text>
        <Text dimColor>{username}</Text>
        <Text dimColor>{"  "}⟳ {timeStr}</Text>
        <Text dimColor>{"  "}({intervalMinutes}m interval)</Text>
      </Text>
    </Box>
  );
}
