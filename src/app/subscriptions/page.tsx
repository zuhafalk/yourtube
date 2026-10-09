"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Crown,
  Loader2,
  Shield,
  Download,
  Play,
} from "lucide-react";

type UserPlan = {
  id: string;
  plan: string;
  status: string;
  startDate: string;
  expiryDate: string | null;
  renewalDate: string | null;
  amount: number | null;
  currency: string | null;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

const plans = [
  {
    name: "FREE",
    price: "₹0",
    period: "Forever",
    description: "Basic access for everyone",
    icon: Shield,
    features: [
      "Basic video access",
      "Standard video quality",
      "Limited downloads",
      "Basic watch history",
    ],
  },
  {
    name: "BRONZE",
    price: "₹99",
    period: "per month",
    description: "More access for regular viewers",
    icon: Play,
    features: [
      "All Free features",
      "HD video quality",
      "More downloads",
      "Extended watch access",
      "Ad-free viewing",
    ],
  },
  {
    name: "SILVER",
    price: "₹199",
    period: "per month",
    description: "Enhanced viewing experience",
    icon: Download,
    features: [
      "All Bronze features",
      "Full HD quality",
      "Higher download limits",
      "Offline access",
      "Ad-free viewing",
      "Priority streaming",
    ],
  },
  {
    name: "GOLD",
    price: "₹299",
    period: "per month",
    description: "Complete premium experience",
    icon: Crown,
    features: [
      "All Silver features",
      "Highest video quality",
      "Maximum downloads",
      "Offline access",
      "Ad-free viewing",
      "Priority streaming",
      "Exclusive premium content",
    ],
  },
];

export default function SubscriptionsPage() {
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadPlan() {
      try {
        const response = await fetch("/api/plans");
        const data = await response.json();

        if (data.success) {
          setCurrentPlan(data.plan);
        }
      } catch (error) {
        console.error("Failed to load subscription plan:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPlan();
  }, []);

  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  function isCurrentPlan(planName: string) {
    return currentPlan?.plan === planName;
  }

  async function choosePlan(planName: string) {
    if (planName === "FREE") {
      return;
    }

    setProcessingPlan(planName);
    setMessage("");

    try {
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: planName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to create payment order"
        );
      }

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout is still loading. Please try again."
        );
      }

      const options = {
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Your Tube",
        description: `${planName} Monthly Subscription`,
        order_id: data.order.id,

        handler: async function (paymentResponse: any) {
          console.log("Razorpay payment response:", paymentResponse);

          try {
            setMessage("Payment successful. Verifying payment...");

            const verifyResponse = await fetch(
              "/api/payments/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,

                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,

                  razorpay_signature:
                    paymentResponse.razorpay_signature,

                  plan: planName,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(
                verifyData.message ||
                  "Payment verification failed"
              );
            }

            setMessage(
              `${planName} subscription activated successfully.`
            );

            setCurrentPlan(verifyData.plan);
          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            setMessage(
              error instanceof Error
                ? error.message
                : "Payment verification failed."
            );
          } finally {
            setProcessingPlan(null);
          }
        },

        modal: {
          ondismiss: function () {
            setMessage("Payment window was closed.");
            setProcessingPlan(null);
          },
        },

        theme: {
          color: "#000000",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response: any) {
          console.error("Razorpay payment failed:", {
            code: response?.error?.code,
            description: response?.error?.description,
            source: response?.error?.source,
            step: response?.error?.step,
            reason: response?.error?.reason,
            metadata: response?.error?.metadata,
          });

          setMessage(
            response.error?.description ||
              "Payment failed. Please try again."
          );

          setProcessingPlan(null);
        }
      );

      razorpay.open();

      setMessage(
        `Razorpay checkout opened for ${planName}.`
      );
    } catch (error) {
      console.error("Payment error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the payment."
      );

      setProcessingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="h-16 bg-white border-b flex items-center px-4 md:px-8 gap-4">
        <Link
          href="/"
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Back to home"
        >
          <ArrowLeft size={24} />
        </Link>

        <div>
          <h1 className="text-xl font-bold">Subscriptions</h1>

          <p className="text-xs text-gray-500">
            Choose your Your Tube plan
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">
            Choose your plan
          </h2>

          <p className="text-gray-500 mt-3">
            Upgrade your Your Tube experience with more features,
            better quality and additional access.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16 gap-2 text-gray-500">
            <Loader2 size={22} className="animate-spin" />
            Loading your current plan...
          </div>
        ) : currentPlan ? (
          <div className="max-w-3xl mx-auto mt-8 bg-white border rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">
                  Your current plan
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <Crown size={20} />

                  <span className="text-xl font-bold">
                    {currentPlan.plan}
                  </span>

                  <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {currentPlan.status}
                  </span>
                </div>
              </div>

              <div className="text-left md:text-right">
                <p className="text-sm text-gray-500">
                  Started
                </p>

                <p className="font-medium">
                  {new Date(
                    currentPlan.startDate
                  ).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {message && (
          <div className="max-w-3xl mx-auto mt-6 bg-white border rounded-xl p-4 text-sm break-all">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const current = isCurrentPlan(plan.name);
            const processing = processingPlan === plan.name;

            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl border p-6 shadow-sm ${
                  current
                    ? "border-black ring-2 ring-black"
                    : "border-gray-200"
                }`}
              >
                {current && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-black text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Icon size={22} />
                  </div>

                  <span className="text-sm font-bold text-gray-500">
                    {plan.name}
                  </span>
                </div>

                <h3 className="text-2xl font-bold mt-6">
                  {plan.price}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {plan.period}
                </p>

                <p className="text-gray-600 text-sm mt-4 min-h-10">
                  {plan.description}
                </p>

                <div className="border-t my-5" />

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check
                        size={18}
                        className="shrink-0 mt-0.5"
                      />

                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  disabled={current || processing}
                  onClick={() => choosePlan(plan.name)}
                  className={`w-full mt-7 py-3 rounded-xl font-semibold transition ${
                    current
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : processing
                        ? "bg-gray-300 text-gray-600 cursor-wait"
                        : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  {current
                    ? "Current Plan"
                    : processing
                      ? "Opening Checkout..."
                      : `Choose ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto mt-10 bg-white border rounded-2xl p-5">
          <h3 className="font-bold text-lg">
            Subscription information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-500">
                Current plan
              </p>

              <p className="font-semibold mt-1">
                {currentPlan?.plan || "FREE"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Status
              </p>

              <p className="font-semibold mt-1">
                {currentPlan?.status || "ACTIVE"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Renewal
              </p>

              <p className="font-semibold mt-1">
                {currentPlan?.renewalDate
                  ? new Date(
                      currentPlan.renewalDate
                    ).toLocaleDateString("en-IN")
                  : "Not applicable"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}