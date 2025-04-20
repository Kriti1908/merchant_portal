import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import "./choose-plan-style.css";

export default function ChoosePlan() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const searchParams = new URLSearchParams(window.location.search);
  const projectId = searchParams.get("projectId");
  // const navigate = useNavigate();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  const plans = {
    monthly: [
      {
        name: "Basic",
        price: "9.95",
        apiCalls: 200,
        features: ["Create up to 5 chatbots", "Basic analytics", "Email support"],
        gradient: "linear-gradient(135deg, #fffcdd, #fbf4a4)", // Blue gradient
      },
      {
        name: "Pro",
        price: "15.99",
        apiCalls: 500,
        features: [
          "Unlimited chatbots",
          "Advanced analytics",
          "Priority support",
        ],
        gradient: "linear-gradient(135deg, #fed5a4, #fecc91)", // Orange gradient
        popular: true,
      },
      {
        name: "Ultimate",
        price: "29.50",
        apiCalls: 1000,
        features: [
          "Unlimited chatbots",
          "Full analytics suite",
          "Dedicated account manager",
        ],
        gradient: "linear-gradient(135deg, #FEC3FF, #E7C6FF)", // Purple gradient
      },
    ],
    annually: [
      {
        name: "Basic",
        price: "99.95",
        apiCalls: 200,
        features: ["Create up to 5 chatbots", "Basic analytics", "Email support"],
        gradient: "linear-gradient(135deg, #fffcdd, #fbf4a4)", // Blue gradient
      },
      {
        name: "Pro",
        price: "159.99",
        apiCalls: 500,
        features: [
          "Unlimited chatbots",
          "Advanced analytics",
          "Priority support",
        ],
        gradient: "linear-gradient(135deg, #fed5a4, #fecc91)", // Orange gradient
        popular: true,
      },
      {
        name: "Ultimate",
        price: "299.50",
        apiCalls: 1000,
        features: [
          "Unlimited chatbots",
          "Full analytics suite",
          "Dedicated account manager",
        ],
        gradient: "linear-gradient(135deg, #FEC3FF, #E7C6FF)", // Purple gradient
      },
    ],
  };

  // Mutation to create the project
  const createProject = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        body: formData, // Use the FormData directly
      });

      console.log(formData);
      formData.forEach((value, key) => {
        console.log(`${key}:`, value);
      });

      if (!res.ok) {
        // Handle error responses
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create project");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Success",
        description: "API key generated successfully",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePlanSelection = (plan) => {
    const projectData = JSON.parse(localStorage.getItem("projectData") || "{}");
    
    // Store it back to localStorage with plan details
    localStorage.setItem("projectData", JSON.stringify(projectData));
    
    // Store selected plan in localStorage
    localStorage.setItem("selectedPlan", JSON.stringify({
      ...plan,
      billingCycle,
      projectId,
    }));
    
    // Redirect to confirm payment page
    // setLocation("/confirm-payment");
    window.location.href = "/confirm-payment";
  };

  return (
    <div className="choose-plan-wrapper">
      <div className="choose-plan-container">
        <div className="choose-plan-header">
          <h1 className="choose-plan-title">Pricing Plan</h1>
          <p className="choose-plan-subtitle">
            Choose the plan that best fits your business needs.
          </p>
          <div className="toggle-container">
            <button
              className={`toggle-button ${
                billingCycle === "monthly" ? "active" : ""
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </button>
            <button
              className={`toggle-button ${
                billingCycle === "annually" ? "active" : ""
              }`}
              onClick={() => setBillingCycle("annually")}
            >
              Annually
            </button>
          </div>
        </div>

        <div className="plans-container">
          {plans[billingCycle].map((plan, index) => (
            <div
              key={index}
              className={`plan-card ${plan.popular ? "popular-plan" : ""}`}
              style={{ background: plan.gradient }}
            >
              {plan.popular && (
                <span className="popular-badge">Most Popular</span>
              )}
              <h2 className="plan-name">{plan.name}</h2>
              <p className="plan-price">
                <span className="currency">Rs. </span>
                {plan.price}
                <span className="duration">
                  {billingCycle === "monthly" ? "/Mo" : "/Yr"}
                </span>
              </p>
              <ul className="plan-features">
                {plan.features.map((feature, i) => (
                  <li key={i} className="plan-feature">
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="choose-plan-button"
                onClick={() => handlePlanSelection(plan)}
              >
                Choose Plan
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}