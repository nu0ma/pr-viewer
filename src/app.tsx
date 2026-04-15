import { Box, Text, useApp, useInput, useWindowSize } from "ink";
import { useGitHub } from "./hooks/use-github.js";
import { Header } from "./components/header.js";
import { ActionRequired } from "./components/action-required.js";
import { MyPRs } from "./components/my-prs.js";
import { ReviewRequests } from "./components/review-requests.js";
import { Footer } from "./components/footer.js";

interface AppProps {
  intervalMinutes: number;
}

export function App({ intervalMinutes }: AppProps) {
  const intervalMs = intervalMinutes * 60 * 1000;
  const { data, refresh } = useGitHub(intervalMs);
  const { exit } = useApp();
  const { rows } = useWindowSize();

  useInput(
    (input, key) => {
      if (input === "q" || (key.ctrl && input === "c")) {
        exit();
      }
      if (input === "r") {
        refresh();
      }
    },
    { isActive: process.stdin.isTTY === true }
  );

  if (data.isLoading && !data.lastUpdated) {
    return (
      <Box flexDirection="column" height={rows}>
        <Header
          username={data.username || "..."}
          lastUpdated={null}
          intervalMinutes={intervalMinutes}
        />
        <Box paddingLeft={1} marginTop={1}>
          <Text color="cyan">⏳ Fetching PR data from GitHub...</Text>
        </Box>
        <Box flexGrow={1} />
        <Footer lastUpdated={null} intervalMs={intervalMs} />
      </Box>
    );
  }

  if (data.error && !data.lastUpdated) {
    return (
      <Box flexDirection="column" height={rows}>
        <Header
          username="error"
          lastUpdated={null}
          intervalMinutes={intervalMinutes}
        />
        <Box paddingLeft={1} marginTop={1}>
          <Text color="red">Error: {data.error}</Text>
        </Box>
        <Box flexGrow={1} />
        <Footer lastUpdated={null} intervalMs={intervalMs} />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" height={rows}>
      <Header
        username={data.username}
        lastUpdated={data.lastUpdated}
        intervalMinutes={intervalMinutes}
      />

      <Box flexDirection="column" flexGrow={1} overflow="hidden">
        <MyPRs prs={data.myPRs} />
        <ReviewRequests requests={data.reviewRequests} />
        <ActionRequired items={data.actionRequired} />

        {data.isLoading && (
          <Box marginTop={1} paddingLeft={1}>
            <Text color="cyan" dimColor>
              ⟳ Refreshing...
            </Text>
          </Box>
        )}

        {data.error && data.lastUpdated && (
          <Box marginTop={1} paddingLeft={1}>
            <Text color="red" dimColor>
              ⚠ Refresh failed: {data.error}
            </Text>
          </Box>
        )}
      </Box>

      <Footer lastUpdated={data.lastUpdated} intervalMs={intervalMs} />
    </Box>
  );
}
