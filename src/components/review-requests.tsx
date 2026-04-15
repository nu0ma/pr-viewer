import type { ReviewRequest } from "../types.js";
import { Section } from "./section.js";
import { PRRow } from "./pr-row.js";

interface ReviewRequestsProps {
  requests: ReviewRequest[];
}

function sortByRepo<T extends { repo: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.repo.localeCompare(b.repo));
}

export function ReviewRequests({ requests }: ReviewRequestsProps) {
  const sorted = sortByRepo(requests);

  return (
    <Section
      icon="📥"
      title="REVIEW REQUESTS"
      count={requests.length}
      color="yellow"
    >
      {sorted.map((rr, i) => {
        const prevRepo = i > 0 ? sorted[i - 1]!.repo : null;
        return (
          <PRRow
            key={`${rr.repoFullName}#${rr.number}`}
            repo={rr.repo}
            number={rr.number}
            title={rr.title}
            url={rr.url}
            author={rr.author}
            status="📋 Needs review"
            statusColor="yellow"
            showRepo={rr.repo !== prevRepo}
          />
        );
      })}
    </Section>
  );
}
