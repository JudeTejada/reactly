"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  Sparkles,
  BarChart3,
  Zap,
  Shield,
  Code2,
  Star,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function LandingPage() {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Analysis",
      description: "Advanced sentiment analysis using GLM 4.6 to understand user emotions and intent",
    },
    {
      icon: MessageSquare,
      title: "Easy Integration",
      description: "Embeddable widget that works on any website. Copy, paste, and start collecting feedback",
    },
    {
      icon: BarChart3,
      title: "Beautiful Analytics",
      description: "Visualize trends, track sentiment over time, and discover insights with interactive charts",
    },
    {
      icon: Zap,
      title: "Real-time Notifications",
      description: "Get instant Discord alerts for negative feedback so you can respond quickly",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Enterprise-grade security with domain whitelisting and API key authentication",
    },
    {
      icon: Code2,
      title: "Developer Friendly",
      description: "RESTful API, comprehensive docs, and TypeScript SDK for custom integrations",
    },
  ];

  const stats = [
    { value: "10k+", label: "Feedback Analyzed" },
    { value: "98%", label: "Accuracy Rate" },
    { value: "500+", label: "Active Projects" },
    { value: "24/7", label: "Real-time Analysis" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32 border-b">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col items-center justify-center space-y-8 text-center"
          >
            <motion.div variants={itemVariants} className="space-y-6 max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mx-auto">
                Transform Feedback into{" "}
                <span className="text-primary">
                  Actionable Insights
                </span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl text-center">
                Collect, analyze, and understand user feedback with AI-powered sentiment analysis.
                Make data-driven decisions to improve your product.
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/sign-up">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Features
                </Button>
              </Link>
            </motion.div>
            <motion.div variants={itemVariants} className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap justify-center mt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Free plan available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>5-minute setup</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex flex-col items-center justify-center text-center"
              >
                <div className="text-4xl font-bold text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl max-w-3xl mx-auto">
              Everything You Need
            </motion.h2>
            <motion.p variants={itemVariants} className="max-w-[700px] mx-auto text-muted-foreground md:text-lg text-center">
              Powerful features to collect, analyze, and act on user feedback
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="border hover:shadow-lg transition-all duration-300 h-full">
                    <CardHeader className="text-left">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-foreground" />
                      </div>
                      <CardTitle className="text-left">{feature.title}</CardTitle>
                      <CardDescription className="text-base text-left">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-24 bg-muted/30 border-y">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
          >
            <motion.h2 variants={itemVariants} className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl max-w-3xl mx-auto">
              See It In Action
            </motion.h2>
            <motion.p variants={itemVariants} className="max-w-[700px] mx-auto text-muted-foreground md:text-lg text-center">
              Try our feedback widget right now. See how easy it is for your users to share feedback.
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={itemVariants}
            className="flex justify-center items-center"
          >
            <Card className="w-full max-w-4xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle>Live Demo</CardTitle>
                <CardDescription className="text-center">
                  This is how the widget will appear on your website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                  <div className="text-center space-y-2">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Widget demo coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl max-w-3xl mx-auto">
              Loved by Product Teams
            </motion.h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
          >
            {[1, 2, 3].map((i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <CardDescription className="text-base">
                      &quot;Reactly has completely transformed how we handle user feedback.
                      The AI sentiment analysis saves us hours every week.&quot;
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium">PM</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="text-sm font-medium">Product Manager</div>
                        <div className="text-xs text-muted-foreground">Tech Startup</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="flex flex-col items-center justify-center space-y-6 text-center max-w-3xl mx-auto"
          >
            <motion.h2 variants={itemVariants} className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Ready to Get Started?
            </motion.h2>
            <motion.p variants={itemVariants} className="text-primary-foreground/90 md:text-lg text-center">
              Join hundreds of teams using Reactly to understand their users better
            </motion.p>
            <motion.div variants={itemVariants} className="flex justify-center">
              <Link href="/sign-up">
                <Button size="lg" variant="secondary">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
