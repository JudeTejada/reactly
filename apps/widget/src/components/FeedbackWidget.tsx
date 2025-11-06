import { useState } from "react";
import type { WidgetConfig, FeedbackCategory } from "@reactly/shared";
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
    rating: 5,
    category: "other" as FeedbackCategory,
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

      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setFormData({ text: "", rating: 5, category: "other" });
      }, 2000);
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
                <p>{labels.thankYouMessage || "Thank you for your feedback!"}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rly-form">
                <div className="rly-form-group">
                  <label htmlFor="rly-category">Category</label>
                  <select
                    id="rly-category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as FeedbackCategory,
                      })
                    }
                    required
                  >
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="improvement">Improvement</option>
                    <option value="complaint">Complaint</option>
                    <option value="praise">Praise</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="rly-form-group">
                  <label htmlFor="rly-rating">Rating</label>
                  <div className="rly-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`rly-star ${star <= formData.rating ? "rly-star-active" : ""}`}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        aria-label={`Rate ${star} stars`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
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
                      labels.placeholder ||
                      "Tell us what you think..."
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
