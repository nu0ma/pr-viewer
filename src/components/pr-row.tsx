import { Box, Text, Transform } from "ink";

function addHyperlink(url: string) {
  return (text: string) => `\x1b]8;;${url}\x07${text}\x1b]8;;\x07`;
}

interface PRRowProps {
  repo: string;
  number: number;
  title: string;
  url: string;
  author?: string;
  commentsCount?: number;
  status?: string;
  statusColor?: string;
  repoWidth?: number;
  numberWidth?: number;
  authorWidth?: number;
  commentsWidth?: number;
  statusWidth?: number;
  showRepo?: boolean;
}

export function PRRow({
  repo,
  number,
  title,
  url,
  author,
  commentsCount,
  status,
  statusColor = "white",
  repoWidth = 24,
  numberWidth = 8,
  authorWidth = 16,
  commentsWidth = 8,
  statusWidth = 20,
  showRepo = true,
}: PRRowProps) {
  return (
    <Box flexDirection="row" paddingLeft={2}>
      <Box width={repoWidth} flexShrink={0}>
        <Text dimColor wrap="truncate-end">
          {showRepo ? repo : ""}
        </Text>
      </Box>
      <Box width={numberWidth} flexShrink={0}>
        <Text color="cyan">#{number}</Text>
      </Box>
      <Box flexGrow={1} flexShrink={1} marginRight={1}>
        <Transform transform={addHyperlink(url)}>
          <Text wrap="wrap">{title}</Text>
        </Transform>
      </Box>
      {author !== undefined && (
        <Box width={authorWidth} flexShrink={0}>
          <Text color="cyan" wrap="truncate-end">
            {author}
          </Text>
        </Box>
      )}
      {status !== undefined && (
        <Box width={statusWidth} flexShrink={0}>
          <Text color={statusColor} wrap="truncate-end">
            {status}
          </Text>
        </Box>
      )}
      <Box width={commentsWidth} flexShrink={0}>
        {commentsCount !== undefined && (
          <Text color={commentsCount > 0 ? "yellow" : "gray"}>
            💬 {commentsCount}
          </Text>
        )}
      </Box>
    </Box>
  );
}
