import { Badge } from "@/components/ui/badge";
import { SENTIMENT_COLORS, SENTIMENT_EMOJIS } from "@/lib/constants";
import type { SentimentType } from "@reactly/shared";

interface SentimentBadgeProps {
  sentiment: SentimentType;
}

export function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  return (
    <Badge variant="outline" className={SENTIMENT_COLORS[sentiment]}>
      {SENTIMENT_EMOJIS[sentiment]} {sentiment}
    </Badge>
  );
}
