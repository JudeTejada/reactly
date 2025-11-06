import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { FeedbackWidget } from "./components/FeedbackWidget";
import type { WidgetConfig } from "@reactly/shared";

export function initFeedbackWidget(config: WidgetConfig) {
  const containerId = "reactly-feedback-widget";
  let container = document.getElementById(containerId);
  console.log(config, "confiog EMBED");

  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    document.body.appendChild(container);
  }

  const root = createRoot(container);
  root.render(createElement(FeedbackWidget, { config }));

  return {
    destroy: () => {
      root.unmount();
      container?.remove();
    },
  };
}

// Auto-init from data attributes
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    const script = document.querySelector(
      "script[data-reactly-api-key]"
    ) as HTMLScriptElement;

    if (script) {
      const apiKey = script.getAttribute("data-reactly-api-key");
      const projectId = script.getAttribute("data-reactly-project-id");

      if (apiKey && projectId) {
        initFeedbackWidget({
          apiKey,
          projectId,
          position:
            (script.getAttribute("data-position") as any) || "bottom-right",
        });
      }
    }
  });
}
