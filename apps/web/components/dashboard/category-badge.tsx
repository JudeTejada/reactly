import { Badge } from "@/components/ui/badge";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants";
import type { FeedbackCategory } from "@reactly/shared";

interface CategoryBadgeProps {
  category: FeedbackCategory;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <Badge variant="secondary" className={CATEGORY_COLORS[category]}>
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}
