import { initFeedbackWidget } from "./embed";

// Development demo
initFeedbackWidget({
  apiKey: "rly_ryib8Mn1Tj4L3ttR5Wap7UFWZSO3Wf6h",
  projectId: "0b6374a2-efe2-4e1e-9d9b-9238c25a4fe7",
  position: "bottom-right",
  theme: {
    primaryColor: "#3b82f6",
  },
  labels: {
    title: "Share Your Feedback",
    placeholder: "We'd love to hear from you...",
  },
});
