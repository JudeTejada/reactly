import { initFeedbackWidget } from "./embed";

// Development demo
initFeedbackWidget({
  apiKey: "demo-api-key",
  projectId: "demo-project-id",
  position: "bottom-right",
  theme: {
    primaryColor: "#3b82f6",
  },
  labels: {
    title: "Share Your Feedback",
    placeholder: "We'd love to hear from you...",
  },
});
