import { ChartConfig } from "@/components/ui/chart"

export const sentimentChartConfig = {
  positive: {
    label: "Positive",
    color: "hsl(142, 76%, 36%)",
  },
  neutral: {
    label: "Neutral",
    color: "hsl(215, 16%, 47%)",
  },
  negative: {
    label: "Negative",
    color: "hsl(0, 84%, 60%)",
  },
} satisfies ChartConfig

export const categoryChartConfig = {
  bug: {
    label: "Bug",
    color: "hsl(0, 84%, 60%)",
  },
  feature: {
    label: "Feature",
    color: "hsl(221, 83%, 53%)",
  },
  feedback: {
    label: "Feedback",
    color: "hsl(142, 76%, 36%)",
  },
  other: {
    label: "Other",
    color: "hsl(215, 16%, 47%)",
  },
} satisfies ChartConfig

