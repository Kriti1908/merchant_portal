// components/ReviewDialog.tsx
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";
import { Project } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewDialog({ isOpen, onClose }: ReviewDialogProps) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's projects for the dropdown
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: isOpen, // Only fetch when dialog is open
    onError: (error) => {
      console.error("Project loading error:", error);
      toast({
        title: "Error loading projects",
        description: error instanceof Error ? error.message : "Failed to load projects",
        variant: "destructive",
      });
    },
  });

  const createReview = useMutation({
    mutationFn: async (reviewData: { rating: number; comment: string; projectId?: string }) => {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit review");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      // Reset form and close dialog
      setRating(0);
      setComment("");
      setSelectedProjectId("");
      onClose();
      // Refresh any relevant data
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error) => {
      toast({
        title: "Error submitting review",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Review required",
        description: "Please write a review before submitting",
        variant: "destructive",
      });
      return;
    }

    // Create review data object
    const reviewData: { rating: number; comment: string; projectId?: string } = {
      rating,
      comment
    };

    // Only add projectId if a specific chatbot is selected
    if (selectedProjectId && selectedProjectId !== "general-feedback") {
        reviewData.projectId = selectedProjectId;
    }

    createReview.mutate(reviewData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a review</DialogTitle>
          <DialogDescription>
            Share your experience with our chatbot platform
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Rating Stars */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select your rating</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer ${
                    star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          {/* Project Selection Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select a chatbot (optional)</label>
            {isLoadingProjects ? (
              <div className="h-10 bg-slate-100 animate-pulse rounded-md"></div>
            ) : (
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a chatbot (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general-feedback">General feedback</SelectItem>
                  {projects && projects.length > 0 ? (
                    projects.map((project) => (
                      <SelectItem key={project._id} value={project._id}>
                        {project.botName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-chatbots" disabled>
                      No chatbots available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Review Text */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Your review</label>
            <Textarea
              placeholder="Write your review here"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>
          
          {/* User information notice */}
          <div className="text-sm text-gray-500 italic mb-4">
            Your review will be submitted using your account information.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createReview.isPending}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white"
          >
            {createReview.isPending ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}