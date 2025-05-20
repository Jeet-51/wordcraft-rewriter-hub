
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const plans = [
  {
    name: "Free",
    description: "Perfect for trying out our AI humanizer",
    price: "$0",
    features: [
      "10 humanization credits",
      "Basic AI detection avoidance",
      "Text-only humanization",
      "Standard support",
    ],
    credits: 10,
    id: "free",
  },
  {
    name: "Pro",
    description: "For professionals who need more humanization power",
    price: "$19",
    period: "/month",
    features: [
      "100 humanization credits",
      "Advanced AI detection avoidance",
      "Text & document uploads",
      "Priority support",
      "Multiple writing styles",
    ],
    credits: 100,
    popular: true,
    id: "pro",
  },
  {
    name: "Enterprise",
    description: "For teams and high-volume content producers",
    price: "$49",
    period: "/month",
    features: [
      "500 humanization credits",
      "Premium AI detection avoidance",
      "All file formats supported",
      "24/7 dedicated support",
      "Team collaboration",
      "Custom writing styles",
      "API access",
    ],
    credits: 500,
    id: "enterprise",
  },
];

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      navigate("/signup?plan=" + planId);
      return;
    }

    setSelectedPlan(planId);
    navigate("/payment?plan=" + planId);
  };

  return (
    <div className="min-h-screen">
      <section className="py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="space-y-4 text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
              Choose the perfect plan for your content humanization needs.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={
                  plan.popular
                    ? "border-primary relative overflow-hidden"
                    : "border"
                }
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl">
                      Most Popular
                    </div>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground ml-1">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Includes:</p>
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2 text-primary"
                          >
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full ${
                      plan.popular ? "" : "bg-muted hover:bg-muted-foreground/10"
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.id === "free" ? "Get Started" : "Choose Plan"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-12 space-y-4 text-center">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <div className="mx-auto max-w-3xl space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">What happens when I run out of credits?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  When you run out of credits, you'll need to upgrade your plan or wait for the next billing cycle when your credits reset.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">Can I change my plan later?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Yes, you can upgrade, downgrade, or cancel your subscription at any time from your account dashboard.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">Do unused credits roll over?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Credits expire at the end of each billing cycle and do not roll over to the next month.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">Is there a limit to text length?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Free plan users can humanize up to 1,000 words per credit. Pro and Enterprise plans support up to 2,000 words per credit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
