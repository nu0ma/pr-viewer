import { Box, Text } from "ink";
import type { ActionItem } from "../types.js";
import { Section } from "./section.js";
import { PRRow } from "./pr-row.js";

interface ActionRequiredProps {
  items: ActionItem[];
}

function reasonLabel(reason: string): { label: string; color: string } {
  switch (reason) {
    case "comment":
      return { label: "💬 New comment", color: "magenta" };
    case "review_requested":
      return { label: "📋 Review req", color: "yellow" };
    default:
      return { label: reason, color: "white" };
  }
}

function sortByRepo<T extends { repo: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.repo.localeCompare(b.repo));
}

export function ActionRequired({ items }: ActionRequiredProps) {
  if (items.length === 0) {
    return (
      <Box flexDirection="column" marginTop={1}>
        <Box paddingLeft={1}>
          <Text bold color="green">
            ✅ No actions required
          </Text>
        </Box>
      </Box>
    );
  }

  const sorted = sortByRepo(items);

  return (
    <Section icon="🔴" title="ACTION REQUIRED" count={items.length} color="red">
      {sorted.map((item, i) => {
        const { label, color } = reasonLabel(item.reason);
        const prevRepo = i > 0 ? sorted[i - 1]!.repo : null;
        return (
          <PRRow
            key={`${item.repoFullName}#${item.number}`}
            repo={item.repo}
            number={item.number}
            title={item.title}
            url={item.url}
            author={item.author ?? ""}
            status={label}
            statusColor={color}
            showRepo={item.repo !== prevRepo}
          />
        );
      })}
    </Section>
  );
}
