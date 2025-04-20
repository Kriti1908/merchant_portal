import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import "./confirm-payment-style.css";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type PlanDetails = {
  name: string;
  price: string; // Use `string` if the price is stored as a string, or `number` if it's a number
  apiCalls: number;
  billingCycle: string;
  features: string[];
};

export default function ConfirmPayment() {
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, processing, success, failed
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Get plan details from localStorage
    const storedPlan = localStorage.getItem("selectedPlan");
    if (storedPlan) {
      setPlanDetails(JSON.parse(storedPlan));
    } else {
      // Redirect to choose plan if no plan is selected
      setLocation("/choose-plan");
    }

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [setLocation]);

  // Mutation to create order
  const createOrder = useMutation({
    mutationFn: async () => {
      if (!planDetails) return null;
      
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(planDetails.price),
          currency: "INR",
          receipt: `plan_purchase_${Date.now()}`,
          notes: {
            planName: planDetails.name,
            billingCycle: planDetails.billingCycle,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data) {
        displayRazorpay(data);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to create project after successful payment
  const createProject = useMutation({
    mutationFn: async (paymentData) => {
      const projectData = JSON.parse(localStorage.getItem("projectData") || "{}");
      const selectedPlan = JSON.parse(localStorage.getItem("selectedPlan") || "{}");

      if (!planDetails) {
        throw new Error("Plan details are missing. Please select a plan.");
      }
      
      // Add selected plan details to the project data
      const formData = new FormData();
      Object.entries(projectData).forEach(([key, value]) => {
        formData.append(key, typeof value === "number" ? value.toString() : String(value));
      });
      
      // Add plan details
      formData.append("plan_type", planDetails.name);
      formData.append("total_api_calls", planDetails.apiCalls.toString());
      
      // Add payment details
      formData.append("payment_id", paymentData.razorpay_payment_id);
      formData.append("order_id", paymentData.razorpay_order_id);
      formData.append("billingCycle", selectedPlan.billingCycle);

      if (selectedPlan.projectId) {
        // Reactivate existing project
        const res = await fetch(`/api/projects/${selectedPlan.projectId}/reactivate`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            billingCycle: selectedPlan.billingCycle,
            payment_id: paymentData.razorpay_payment_id,
            order_id: paymentData.razorpay_order_id,
          }),
        });
  
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to reactivate project");
        }
  
        return res.json();
      } else {
        const res = await fetch("/api/projects", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to create project");
        }

        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Success",
        description: "Project created and API key generated successfully",
      });
      
      // Clear stored data
      localStorage.removeItem("selectedPlan");
      localStorage.removeItem("projectData");
      
      // Redirect to dashboard
      setTimeout(() => {
        setLocation("/dashboard");
      }, 2000);
    },
    onError: (error) => {
      setPaymentStatus("failed");
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const displayRazorpay = (orderData) => {
    const options = {
      key: "rzp_test_ciCYcw2lcazrdl", // Your Razorpay Key ID
      amount: orderData.amount,
      currency: orderData.currency,
      name: "AI Chat Platform",
      description: `${planDetails.name} Plan (${planDetails.billingCycle})`,
      order_id: orderData.id,
      handler: function (response) {
        // Handle successful payment
        handlePaymentSuccess(response);
      },
      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
      },
      theme: {
        color: "#3399cc",
      },
      modal: {
        ondismiss: function () {
          toast({
            title: "Payment cancelled",
            description: "You have cancelled the payment process",
          });
        },
      },
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  };

  const handlePaymentSuccess = (response) => {
    setPaymentStatus("processing");
    
    // Verify payment on server and create project
    fetch("/api/verify-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          // Payment verification successful
          setPaymentStatus("success");
          // Create project with payment details
          createProject.mutate(response);
        } else {
          // Payment verification failed
          setPaymentStatus("failed");
          toast({
            title: "Payment verification failed",
            description: "Please contact support for assistance",
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        setPaymentStatus("failed");
        toast({
          title: "Error",
          description: "Failed to verify payment",
          variant: "destructive",
        });
      });
  };

  const handleProceedToPayment = () => {
    createOrder.mutate();
  };

  if (!planDetails) {
    return (
      <div className="confirm-payment-container">
        <div className="loading-spinner">
          <Loader2 className="animate-spin h-8 w-8" />
          <p>Loading plan details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="confirm-payment-container">
      <div className="confirm-payment-card">
        {paymentStatus === "pending" && (
          <>
            <h1 className="confirm-payment-title">Confirm Your Purchase</h1>
            <div className="order-summary">
              <h2 className="summary-title">Order Summary</h2>
              <div className="plan-details">
                <div className="plan-info">
                  <span className="plan-name">{planDetails.name} Plan</span>
                  <span className="plan-billing">
                    {planDetails.billingCycle === "monthly" ? "Monthly" : "Annual"} Billing
                  </span>
                </div>
                <div className="plan-price">
                  Rs. {planDetails.price}
                  <span className="price-cycle">
                    /{planDetails.billingCycle === "monthly" ? "mo" : "yr"}
                  </span>
                </div>
              </div>
              <div className="plan-features">
                <h3>Plan Features:</h3>
                <ul>
                  <li>{planDetails.apiCalls} API calls</li>
                  {planDetails.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="total-section">
                <span className="total-label">Total</span>
                <span className="total-amount">
                  Rs. {planDetails.price}
                  <span className="price-cycle">
                    /{planDetails.billingCycle === "monthly" ? "mo" : "yr"}
                  </span>
                </span>
              </div>
            </div>
            <div className="payment-actions">
              <Button 
                variant="outline" 
                className="back-button"
                onClick={() => setLocation("/choose-plan")}
              >
                Back to Plans
              </Button>
              <Button 
                className="proceed-button"
                onClick={handleProceedToPayment}
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Proceed to Payment"
                )}
              </Button>
            </div>
          </>
        )}

        {paymentStatus === "processing" && (
          <div className="payment-processing">
            <Loader2 className="animate-spin h-12 w-12 mb-4" />
            <h2>Confirming your payment...</h2>
            <p>Please wait while we verify your payment.</p>
          </div>
        )}

        {paymentStatus === "success" && (
          <div className="payment-success">
            <div className="success-icon">✓</div>
            <h2>Payment Successful!</h2>
            <p className="generating-message">
              {createProject.isPending ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2 inline" />
                  Generating your API key...
                </>
              ) : (
                "API key generated successfully!"
              )}
            </p>
            <p className="redirect-message">Redirecting to dashboard...</p>
          </div>
        )}

        {paymentStatus === "failed" && (
          <div className="payment-failed">
            <div className="failed-icon">✗</div>
            <h2>Payment Failed</h2>
            <p>There was an issue with your payment. Please try again.</p>
            <Button 
              onClick={() => setPaymentStatus("pending")}
              className="retry-button"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}