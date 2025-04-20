import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, Key, Calendar, BarChart3, 
  FileText, Code, CreditCard, Info
} from "lucide-react";
import { ReviewDialog } from "@/components/ReviewDialog"; // Import the new component
import "./dashboard-style.css";

export default function Dashboard() {
  const { toast } = useToast();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false); // Add state for dialog
  const [selectedProject, setSelectedProject] = useState<Project | null>(null); // State for selected project
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState("overview");

  // Add this effect to handle tooltip cleanup
  useEffect(() => {
    return () => {
      const tooltipEl = document.querySelector(".tooltip");
      if (tooltipEl) tooltipEl.remove();
    };
  }, []);

  // Add this function to handle tooltip
  const handleTooltip = (e, text, show) => {
    if (show) {
      const tooltipEl = document.createElement("div");
      tooltipEl.className = "tooltip";
      tooltipEl.innerText = text;
      tooltipEl.style.top = `${e.clientY + 15}px`;
      tooltipEl.style.left = `${e.clientX + 10}px`;
      document.body.appendChild(tooltipEl);
      
      // Trigger animation
      setTimeout(() => tooltipEl.classList.add("visible"), 10);
    } else {
      const tooltipEl = document.querySelector(".tooltip");
      if (tooltipEl) {
        tooltipEl.classList.remove("visible");
        setTimeout(() => tooltipEl.remove(), 200);
      }
    }
  };

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    onError: (error) => {
      console.error("Project loading error:", error);
      toast({
        title: "Error loading projects",
        description: error instanceof Error ? error.message : "Failed to load projects",
        variant: "destructive",
      });
    },
  });

  const handleAnalyticsClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="project-card">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div>
            <h1>Your Dashboard</h1>
            <p>Manage your chatbots and monitor their performance</p>
          </div>
          <Link href="/generate-api">
            <Button className="create-button">
              <Bot className="h-5 w-5" />
              Create New Chatbot
            </Button>
          </Link>
        </div>
    
        {/* Quick Stats Section */}
        <div className="quick-stats">
          <div className="stat-card">
            <Bot className="stat-icon" />
            <div className="stat-text">
              <p className="stat-title">Total Chatbots</p>
              <p className="stat-value">{projects?.length || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <Key className="stat-icon" />
            <div className="stat-text">
              <p className="stat-title">Active API Keys</p>
              <p className="stat-value">{projects?.filter((project) => project.isActive).length || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <Calendar className="stat-icon" />
            <div className="stat-text">
              <p className="stat-title">Last Created</p>
              <p className="stat-value">
                {projects && projects.length > 0
                  ? new Date(projects[0].createdAt).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>
    
        {/* Projects Section */}
        {(!projects || projects.length === 0) ? (
          <div className="no-projects">
            <Bot className="no-projects-icon" />
            <h2>No Chatbots Yet</h2>
            <p>Create your first chatbot to start engaging with your customers</p>
            <Link href="/generate-api">
              <Button className="create-button">Create Your First Chatbot</Button>
            </Link>
          </div>
        ) : (
          <div className="project-cards">
            {projects.map((project) => (
              <Card key={project._id} className="project-card">
                <CardHeader className="project-card-header">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      {project.name}
                    </CardTitle>
                    <div className="chart-icon-wrapper"
                      onMouseEnter={(e) => handleTooltip(e, "View Analytics", true)}
                      onMouseLeave={(e) => handleTooltip(e, "", false)}
                      onClick={() => handleAnalyticsClick(project)}
                    >
                      <BarChart3
                        className="chart-icon"
                      />
                    </div>
                  </div>
                  <CardDescription>{project.botName}</CardDescription>
                </CardHeader>
                <CardContent className="project-card-content">
                  <div className="info">
                    <p className="info-title">Service Type</p>
                    <p className="info-value">{project.serviceType}</p>
                  </div>
                  <div className="info">
                    <p className="info-title">API Key</p>
                    <p className="api-key">{project.apiKey}</p>
                  </div>
                  <div className="info">
                    <p className="info-title">Plan Expiry</p>
                    <p className="info-value">
                      {new Date(project.plan_expiry).toLocaleDateString()}
                    </p>
                  </div>
                  {project.isActive ? (
                    <Button
                      className="chat-button"
                      onClick={() => {
                        const chatUrl = `/chat?name=${encodeURIComponent(project.botName)}&key=${encodeURIComponent(project.apiKey)}`;
                        window.open(chatUrl, '_blank');
                      }}
                    >
                      Chat with Bot!
                    </Button>
                  ) : (
                    <Button
                      className="reactivate-button"
                      onClick={() => setLocation(`/choose-plan?projectId=${project._id}`)}
                    >
                      Re-activate to Continue
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      {/* Modal for Detailed Analytics */}
      {isModalOpen && selectedProject && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProject.name}</h2>
              <div className="modal-tabs">
                <button 
                  className={`modal-tab ${activeTab === "overview" ? "active" : ""}`}
                  onClick={() => setActiveTab("overview")}
                >
                  <Info size={16} className="mr-1" />
                  Overview
                </button>
                <button 
                  className={`modal-tab ${activeTab === "documents" ? "active" : ""}`}
                  onClick={() => setActiveTab("documents")}
                >
                  <FileText size={16} className="mr-1" />
                  Documents
                </button>
                <button 
                  className={`modal-tab ${activeTab === "states" ? "active" : ""}`}
                  onClick={() => setActiveTab("states")}
                >
                  <Code size={16} className="mr-1" />
                  States
                </button>
                <button 
                  className={`modal-tab ${activeTab === "payment" ? "active" : ""}`}
                  onClick={() => setActiveTab("payment")}
                >
                  <CreditCard size={16} className="mr-1" />
                  Payment
                </button>
              </div>
            </div>
            
            {/* Overview Tab */}
            <div className={`tab-content ${activeTab === "overview" ? "active" : ""}`}>
              <div className="modal-analytics-grid">
                <div className="analytics-item">
                  <div className="label">Bot Name</div>
                  <div className="value">{selectedProject.botName}</div>
                </div>
                
                <div className="analytics-item">
                  <div className="label">Service Type</div>
                  <div className="value">{selectedProject.serviceType}</div>
                </div>
                
                <div className="analytics-item">
                  <div className="label">Plan</div>
                  <div className="value">{selectedProject.plan_type}</div>
                </div>
                
                <div className="analytics-item">
                  <div className="label">Total API Calls</div>
                  <div className="value">{selectedProject.total_api_calls}</div>
                </div>
                
                <div className="analytics-item">
                  <div className="label">Plan Expiry</div>
                  <div className="value">
                    {new Date(selectedProject.plan_expiry).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="analytics-item">
                  <div className="label">Status</div>
                  <div className="value">
                    <span className="status-indicator">
                      <span className={`status-dot ${selectedProject.isActive ? "active" : "inactive"}`}></span>
                      {selectedProject.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                
                <div className="analytics-item">
                  <div className="label">Created At</div>
                  <div className="value">
                    {new Date(selectedProject.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="analytics-item">
                  <div className="label">Last Updated</div>
                  <div className="value">
                    {new Date(selectedProject.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="analytics-item full-width api-key">
                  <div className="label">API Key</div>
                  <div className="value">{selectedProject.apiKey}</div>
                </div>
                
                {selectedProject.bot_link && (
                  <div className="analytics-item full-width">
                    <div className="label">Bot Link</div>
                    <div className="value">{selectedProject.bot_link}</div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Documents Tab */}
            <div className={`tab-content ${activeTab === "documents" ? "active" : ""}`}>
              {selectedProject.documents && selectedProject.documents.length > 0 ? (
                <div className="documents-list">
                  {selectedProject.documents.map((doc, index) => (
                    <div className="document-item" key={index}>
                      <div className="document-header">
                        <div className="document-title">{doc.originalName}</div>
                        <div className="document-type">{doc.type}</div>
                      </div>
                      <div className="document-meta">
                        Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FileText size={48} opacity={0.3} className="mb-3" />
                  <p>No documents available</p>
                </div>
              )}
            </div>
            
            {/* States Tab */}
            <div className={`tab-content ${activeTab === "states" ? "active" : ""}`}>
              {selectedProject.states && selectedProject.states.length > 0 ? (
                <div className="states-list">
                  {selectedProject.states.map((state, index) => (
                    <div className="state-item" key={index}>
                      <div className="state-header">
                        <div className="state-title">{state.name}</div>
                        <div className="state-order">Order: {index}</div>
                      </div>
                      <div className="state-content">
                        <div className="mb-2">
                          <strong>Utterances:</strong> {state.utterances.length}
                        </div>
                        <div className="mb-2">
                          <strong>Responses:</strong> {state.responses.length}
                        </div>
                        <div className="text-sm opacity-75">
                          <strong>Specification:</strong> {state.specification.slice(0, 50)}...
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Code size={48} opacity={0.3} className="mb-3" />
                  <p>No states defined</p>
                </div>
              )}
            </div>
            
            {/* Payment Tab */}
            <div className={`tab-content ${activeTab === "payment" ? "active" : ""}`}>
              {selectedProject.payment && selectedProject.payment.paymentId ? (
                <div className="payment-info">
                  <div className="payment-header">
                    <h3>Payment Information</h3>
                    <span className={`payment-status ${selectedProject.payment.status}`}>
                      {selectedProject.payment.status}
                    </span>
                  </div>
                  <div className="payment-details">
                    <div className="payment-detail">
                      <span className="detail-label">Payment ID</span>
                      <span className="detail-value">{selectedProject.payment.paymentId}</span>
                    </div>
                    <div className="payment-detail">
                      <span className="detail-label">Order ID</span>
                      <span className="detail-value">{selectedProject.payment.orderId}</span>
                    </div>
                    <div className="payment-detail">
                      <span className="detail-label">Amount</span>
                      <span className="detail-value">
                        {selectedProject.payment.amount} {selectedProject.payment.currency}
                      </span>
                    </div>
                    <div className="payment-detail">
                      <span className="detail-label">Date</span>
                      <span className="detail-value">
                        {new Date(selectedProject.payment.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <CreditCard size={48} opacity={0.3} className="mb-3" />
                  <p>No payment information available</p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="close-button" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    
        {/* Test Bot Chat Button */}
        <div className="test-bot-chat">
          <Link href="/test-bot-chat">
            <Button className="test-button">
              <Bot className="h-4 w-4" />
              Test Bot Chat
            </Button>
          </Link>
        </div>

        
    
        {/* Review Section */}
        <div className="review-section">
          <h2>Liking our services? Leave a review!</h2>
          <p>Your feedback helps us improve and grow.</p>
          <Button 
            className="review-button" 
            onClick={() => setIsReviewDialogOpen(true)}
          >
            Leave a Review
          </Button>
        </div>
        
        {/* Add the Review Dialog */}
        <ReviewDialog 
          isOpen={isReviewDialogOpen} 
          onClose={() => setIsReviewDialogOpen(false)} 
        />
      </div>
    </div>
  );
}