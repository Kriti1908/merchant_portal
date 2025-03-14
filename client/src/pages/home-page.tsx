import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
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

export default function HomePage() {
  const { user } = useAuth();

  const features = [
    {
      icon: <Bot className="h-8 w-8 mb-4 text-primary" />,
      title: "Custom Chatbots",
      description: "Create tailored chatbots that understand your business context and customer needs."
    },
    {
      icon: <MessageSquare className="h-8 w-8 mb-4 text-primary" />,
      title: "Natural Conversations",
      description: "Engage customers with human-like interactions powered by advanced AI technology."
    },
    {
      icon: <Settings className="h-8 w-8 mb-4 text-primary" />,
      title: "Easy Configuration",
      description: "Set up and customize your chatbot with our intuitive drag-and-drop interface."
    },
    {
      icon: <BarChart3 className="h-8 w-8 mb-4 text-primary" />,
      title: "Analytics Dashboard",
      description: "Track performance metrics and gain insights into customer interactions."
    },
    {
      icon: <Shield className="h-8 w-8 mb-4 text-primary" />,
      title: "Secure Integration",
      description: "Enterprise-grade security with encrypted data transmission and storage."
    },
    {
      icon: <Code className="h-8 w-8 mb-4 text-primary" />,
      title: "Simple API",
      description: "Seamlessly integrate your chatbot with existing systems using our REST API."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Customer Service Manager",
      company: "TechCorp Solutions",
      content: "Aksion has transformed our customer service. The chatbot handles routine inquiries efficiently, allowing our team to focus on complex issues.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "E-commerce Director",
      company: "Global Retail",
      content: "The customization options are incredible. We've seen a 40% increase in customer satisfaction since implementing Aksion's chatbot.",
      rating: 5
    },
    {
      name: "Emily Williams",
      role: "Operations Lead",
      company: "Swift Services",
      content: "Easy to set up and maintain. The analytics provided help us continuously improve our customer interactions.",
      rating: 4
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Create Intelligent Chatbots for Your Business
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Enhance customer engagement with AI-powered chatbots tailored to your needs. No coding required.
              </p>
              {!user && (
                <Link href="/auth">
                  <Button size="lg" className="text-lg">
                    Get Started <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
            <div>
              <img
                src="https://media.licdn.com/dms/image/D5612AQFKAJUuea57ww/article-cover_image-shrink_720_1280/0/1714627320235?e=2147483647&v=beta&t=ZjcvjDfrsm_MLC9r1VBym9R-PATJojWJ-IdNndPet1k"
                alt="Chatbot Interface"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create, manage, and optimize your chatbot experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
                {feature.icon}
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Trusted by businesses worldwide to deliver exceptional customer experiences
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">{testimonial.content}</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                  <p className="text-sm text-gray-500">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Customer Service?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using Aksion to deliver exceptional customer experiences
          </p>
          {user ? (
            <Link href="/dashboard">
              <Button variant="secondary" size="lg">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/auth">
              <Button variant="secondary" size="lg">
                Start Free Trial
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}