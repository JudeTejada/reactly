import { useState } from "react";
import type { WidgetConfig } from "@reactly/shared";
import { submitFeedbackSchema } from "@reactly/shared";
import "./FeedbackWidget.css";

interface FeedbackWidgetProps {
  config: WidgetConfig;
}

export function FeedbackWidget({ config }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    text: "",
    name: "",
    email: "",
  });

  const position = config.position || "bottom-right";
  const theme = config.theme || {};
  const labels = config.labels || {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const validatedData = submitFeedbackSchema.parse(formData);

      const apiUrl = config.apiUrl || "http://localhost:3001/api";
      const response = await fetch(`${apiUrl}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.apiKey,
          "x-project-id": config.projectId,
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      // Immediate success feedback - AI processing happens in background
      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setFormData({ text: "", name: "", email: "" });
      }, 1500); // Shorter delay since we're showing success immediately
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const positionClasses = {
    "bottom-right": "rly-bottom-right",
    "bottom-left": "rly-bottom-left",
    "top-right": "rly-top-right",
    "top-left": "rly-top-left",
  };

  return (
    <>
      {!isOpen && (
        <button
          className={`rly-trigger ${positionClasses[position]}`}
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: theme.primaryColor || "#3b82f6",
          }}
          aria-label="Open feedback form"
        >
          💬
        </button>
      )}

      {isOpen && (
        <div className={`rly-widget ${positionClasses[position]}`}>
          <div
            className="rly-widget-container"
            style={{
              backgroundColor: theme.backgroundColor || "#ffffff",
              color: theme.textColor || "#000000",
            }}
          >
            <div className="rly-widget-header">
              <h3>{labels.title || "Send Feedback"}</h3>
              <button
                className="rly-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {isSuccess ? (
              <div className="rly-success">
                <div className="rly-success-icon">✓</div>
                <p>
                  {labels.thankYouMessage ||
                    "Thanks! Your feedback has been submitted and will be analyzed shortly."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rly-form">
                <div className="rly-form-group">
                  <label htmlFor="rly-name">Name *</label>
                  <input
                    type="text"
                    id="rly-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Your name"
                    required
                    maxLength={100}
                  />
                </div>

                <div className="rly-form-group">
                  <label htmlFor="rly-email">Email *</label>
                  <input
                    type="email"
                    id="rly-email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="rly-form-group">
                  <label htmlFor="rly-text">Your Feedback</label>
                  <textarea
                    id="rly-text"
                    value={formData.text}
                    onChange={(e) =>
                      setFormData({ ...formData, text: e.target.value })
                    }
                    placeholder={
                      labels.placeholder || "Tell us what you think..."
                    }
                    rows={4}
                    required
                    maxLength={5000}
                  />
                </div>

                {error && <div className="rly-error">{error}</div>}

                <button
                  type="submit"
                  className="rly-submit-btn"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: theme.primaryColor || "#3b82f6",
                  }}
                >
                  {isSubmitting
                    ? "Sending..."
                    : labels.submitButton || "Submit Feedback"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
