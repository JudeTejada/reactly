import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sparkles,
  MessageSquare,
  BarChart3,
  Zap,
  Shield,
  Code2,
  Bell,
  Download,
  Filter,
  Globe,
  Lock,
  Palette,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Sentiment Analysis",
    description: "Powered by OpenAI GPT-3.5, our AI analyzes every piece of feedback to determine sentiment (positive, negative, neutral) with confidence scores.",
    color: "purple",
  },
  {
    icon: MessageSquare,
    title: "Embeddable Widget",
    description: "Beautiful, customizable feedback widget that integrates seamlessly into any website. Multiple position options and theme customization.",
    color: "blue",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Interactive charts showing sentiment trends, category breakdowns, and rating distributions. Track performance over time.",
    color: "green",
  },
  {
    icon: Zap,
    title: "Real-time Notifications",
    description: "Instant Discord webhooks for negative feedback. Never miss critical issues and respond to users quickly.",
    color: "yellow",
  },
  {
    icon: Filter,
    title: "Powerful Filtering",
    description: "Filter feedback by sentiment, category, date range, or search text. Find exactly what you're looking for instantly.",
    color: "red",
  },
  {
    icon: Download,
    title: "Export to CSV",
    description: "Export your feedback data for further analysis in Excel, Google Sheets, or your favorite data tools.",
    color: "indigo",
  },
  {
    icon: Globe,
    title: "Domain Whitelisting",
    description: "Control where your widget can be embedded. Protect your API keys with domain restrictions.",
    color: "pink",
  },
  {
    icon: Lock,
    title: "API Key Authentication",
    description: "Secure API key system for each project. Regenerate keys instantly if compromised.",
    color: "orange",
  },
  {
    icon: Palette,
    title: "Custom Branding",
    description: "Match your brand with customizable colors, text, and positioning. Make the widget feel native to your site.",
    color: "teal",
  },
  {
    icon: Code2,
    title: "Developer API",
    description: "Full REST API with comprehensive documentation. Build custom integrations and workflows.",
    color: "violet",
  },
  {
    icon: Bell,
    title: "Smart Categorization",
    description: "Automatic categorization of feedback into bugs, features, improvements, complaints, and praise.",
    color: "cyan",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 compliant infrastructure, encrypted data storage, and regular security audits.",
    color: "gray",
  },
];

const colorClasses: Record<string, { bg: string; icon: string }> = {
  purple: { bg: "bg-purple-100", icon: "text-purple-600" },
  blue: { bg: "bg-blue-100", icon: "text-blue-600" },
  green: { bg: "bg-green-100", icon: "text-green-600" },
  yellow: { bg: "bg-yellow-100", icon: "text-yellow-600" },
  red: { bg: "bg-red-100", icon: "text-red-600" },
  indigo: { bg: "bg-indigo-100", icon: "text-indigo-600" },
  pink: { bg: "bg-pink-100", icon: "text-pink-600" },
  orange: { bg: "bg-orange-100", icon: "text-orange-600" },
  teal: { bg: "bg-teal-100", icon: "text-teal-600" },
  violet: { bg: "bg-violet-100", icon: "text-violet-600" },
  cyan: { bg: "bg-cyan-100", icon: "text-cyan-600" },
  gray: { bg: "bg-gray-100", icon: "text-gray-600" },
};

export default function FeaturesPage() {
  return (
    <div className="container py-20 px-4 md:px-6">
      <div className="flex flex-col items-center space-y-4 text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Powerful Features for{" "}
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Modern Teams
          </span>
        </h1>
        <p className="max-w-[700px] text-gray-600 md:text-xl">
          Everything you need to collect, analyze, and act on user feedback
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          const colors = colorClasses[feature.color];
          return (
            <Card key={feature.title} className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <div className="mt-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Want to see these features in action?</h2>
        <p className="text-muted-foreground mb-8">Start your free trial today. No credit card required.</p>
      </div>
    </div>
  );
}
