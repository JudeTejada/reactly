import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out Reactly",
    features: [
      "1 project",
      "100 feedback items/month",
      "Basic analytics",
      "Email support",
      "7-day data retention",
      "Community access",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    description: "For growing teams",
    features: [
      "10 projects",
      "10,000 feedback items/month",
      "Advanced analytics & trends",
      "Priority email support",
      "Unlimited data retention",
      "Discord webhooks",
      "Custom branding",
      "CSV export",
      "API access",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      "Unlimited projects",
      "Unlimited feedback",
      "Everything in Pro",
      "Dedicated support",
      "Custom integrations",
      "SSO / SAML",
      "SLA guarantee",
      "On-premise option",
      "Custom AI models",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="container py-20 px-4 md:px-6">
      <div className="flex flex-col items-center space-y-4 text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Simple, Transparent{" "}
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Pricing
          </span>
        </h1>
        <p className="max-w-[700px] text-gray-600 md:text-xl">
          Choose the plan that's right for you. All plans include a 14-day free
          trial.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`flex flex-col ${
              plan.highlighted
                ? "border-2 border-purple-600 shadow-xl scale-105"
                : "border-2"
            }`}
          >
            <CardHeader>
              {plan.highlighted && (
                <div className="text-xs font-semibold text-purple-600 mb-2">
                  MOST POPULAR
                </div>
              )}
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== "Custom" && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>
              <CardDescription className="mt-2">
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="w-full">
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto grid gap-6 text-left">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Can I change plans later?
              </CardTitle>
              <CardDescription>
                Yes! You can upgrade or downgrade at any time. Changes take
                effect immediately.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                What happens if I exceed my limits?
              </CardTitle>
              <CardDescription>
                We&apos;ll notify you when you&apos;re approaching your limit.
                You can upgrade anytime to continue collecting feedback.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              <CardDescription>
                Yes! We offer a 30-day money-back guarantee. If you&apos;re not
                satisfied, we&apos;ll refund your payment.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
