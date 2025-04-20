import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { 
  Bot, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  Shield, 
  Code, 
  Star,
  ChevronRight
} from "lucide-react";
import "./home-page-style.css";

export default function HomePage() {
  const { user } = useAuth();

  const features = [
    {
      icon: <Bot className="feature-icon" />,
      title: "Configurable Customer journey",
      description: "Create tailored chatbots that understand your business context and customer needs."
    },
    {
      icon: <MessageSquare className="feature-icon" />,
      title: "Natural Conversations",
      description: "Engage customers with human-like interactions powered by advanced AI technology."
    },
    {
      icon: <Settings className="feature-icon" />,
      title: "Visual drag and drop",
      description: "Set up and customize your chatbot with our intuitive drag-and-drop interface."
    },
    {
      icon: <BarChart3 className="feature-icon" />,
      title: "Analytics Dashboard",
      description: "Track performance metrics and gain insights into customer interactions."
    },
    {
      icon: <Shield className="feature-icon" />,
      title: "Secure Integration",
      description: "Enterprise-grade security with encrypted data transmission and storage."
    },
    {
      icon: <Code className="feature-icon" />,
      title: "API for third party",
      description: "Seamlessly integrate your chatbot with existing systems using our REST API."
    }
  ];

  // Fetch reviews from the backend
  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ["/api/reviews"],
    queryFn: async () => {
      const response = await fetch("/api/reviews");
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      return response.json();
    },
    onError: (error) => {
      console.error("Error fetching reviews:", error);
    },
  });

  // Sort reviews by rating in descending order and pick the top 3
  const topReviews = reviews
    ? reviews.sort((a, b) => b.rating - a.rating).slice(0, 3)
    : [];


  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Create Intelligent Chatbots for Your Business
              </h1>
              <p className="hero-subtitle">
                Enhance customer engagement with AI-powered chatbots tailored to your needs. No coding required.
              </p>
              {!user && (
                <Link href="/auth">
                  <Button size="lg" className="cta-button">
                    Get Started <ChevronRight className="cta-icon" />
                  </Button>
                </Link>
              )}
            </div>
            <div className="hero-image-container">
              <img
                src="https://media.licdn.com/dms/image/D5612AQFKAJUuea57ww/article-cover_image-shrink_720_1280/0/1714627320235?e=2147483647&v=beta&t=ZjcvjDfrsm_MLC9r1VBym9R-PATJojWJ-IdNndPet1k"
                alt="Chatbot Interface"
                className="hero-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              Powerful Features for Your Business
            </h2>
            <p className="section-subtitle">
              Everything you need to create, manage, and optimize your chatbot experience
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                {feature.icon}
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle">
              Trusted by businesses worldwide to deliver exceptional customer experiences
            </p>
          </div>
          <div className="testimonials-grid">
            {isLoadingReviews ? (
              <p>Loading testimonials...</p>
            ) : (
              topReviews.map((review, index) => (
                <div key={index} className="testimonial-card">
                  <div className="testimonial-header">
                    <img
                      src={review.avatar || "/placeholder.jpg"} // Use avatar if available
                      alt={review.userId.username}
                      className="testimonial-avatar"
                    />
                    <div className="testimonial-meta">
                      <p className="testimonial-name">{review.userId.username}</p>
                    </div>
                  </div>
                  <div className="testimonial-rating">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="star-icon" />
                    ))}
                  </div>
                  <p className="testimonial-content">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">
            Ready to Transform Your Customer Service?
          </h2>
          <p className="cta-subtitle">
            Join thousands of businesses using Aksion to deliver exceptional customer experiences
          </p>
          {user ? (
            <Link href="/dashboard">
              <Button variant="secondary" size="lg" className="cta-button-secondary">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/auth">
              <Button variant="secondary" size="lg" className="cta-button-secondary">
                Start Free Trial
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}