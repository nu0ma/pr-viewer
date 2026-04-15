import type { ReactNode } from "react";
import { Box, Text } from "ink";

interface SectionProps {
  icon: string;
  title: string;
  count: number;
  color: string;
  showComments?: boolean;
  children: ReactNode;
}

export function Section({
  icon,
  title,
  count,
  color,
  showComments = false,
  children,
}: SectionProps) {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Box flexDirection="row" paddingLeft={1}>
        <Text bold color={color}>
          {icon} {title}
        </Text>
        <Text dimColor> ({count})</Text>
      </Box>
      <Box flexDirection="row" paddingLeft={2} height={1}>
        <Box width={24} flexShrink={0} />
        <Box width={8} flexShrink={0}>
          <Text dimColor bold>
            #
          </Text>
        </Box>
        <Box flexGrow={1} flexShrink={1} marginRight={1}>
          <Text dimColor bold>
            TITLE
          </Text>
        </Box>
        <Box width={16} flexShrink={0}>
          <Text dimColor bold>
            AUTHOR
          </Text>
        </Box>
        <Box width={20} flexShrink={0}>
          <Text dimColor bold>
            STATUS
          </Text>
        </Box>
        <Box width={8} flexShrink={0}>
          {showComments && (
            <Text dimColor bold>
              💬
            </Text>
          )}
        </Box>
      </Box>
      {children}
    </Box>
  );
}
