"use client";

import { useEffect } from "react";

export default function WidgetDemoPage() {
  useEffect(() => {
    // Load the widget script
    const script = document.createElement("script");
    script.src = "http://localhost:5173/dist/widget.umd.js";
    script.async = true;
    script.setAttribute("data-reactly-api-key", "demo-api-key");
    script.setAttribute("data-reactly-project-id", "demo-project");
    script.setAttribute("data-position", "bottom-right");

    document.head.appendChild(script);

    return () => {
      // Clean up the script when component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Widget Demo Page
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            This page demonstrates the Reactly feedback widget in action. Look
            for the feedback button in the bottom-right corner!
          </p>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <div className="text-left space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 text-sm font-bold">1</span>
                </div>
                <p className="text-gray-700">
                  The widget loads automatically from the script tag
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 text-sm font-bold">2</span>
                </div>
                <p className="text-gray-700">
                  Click the feedback button in the bottom-right corner
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 text-sm font-bold">3</span>
                </div>
                <p className="text-gray-700">
                  Submit feedback and see the real-time sentiment analysis
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Test Features</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-medium mb-2">✨ What to try:</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>• Submit positive feedback</li>
                  <li>• Submit negative feedback</li>
                  <li>• Try different categories</li>
                  <li>• Test the rating system</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">🔧 Technical Details:</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>• Widget loaded from localhost:5173</li>
                  <li>• Auto-initialization via data attributes</li>
                  <li>• Bottom-right positioning</li>
                  <li>• Demo API key and project ID</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This demo uses a development server. Make
              sure the widget dev server is running on port 5173.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
