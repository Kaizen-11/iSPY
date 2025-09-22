import { Email } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { AISummaryModal } from "./ai-summary-modal";
import { useState } from "react";

interface AiSummaryCardProps {
  email: Email;
  variant?: "gradient" | "default" | "success";
}

export function AiSummaryCard({ email, variant = "default" }: AiSummaryCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const getCardStyle = () => {
    switch (variant) {
      case "gradient":
        return "ai-summary-card text-white";
      case "success":
        return "bg-green-50 border border-green-200";
      default:
        return "bg-accent border border-border";
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "gradient":
        return "text-white";
      case "success":
        return "text-green-800";
      default:
        return "text-muted-foreground";
    }
  };

  const getButtonStyle = () => {
    switch (variant) {
      case "gradient":
        return "text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition-colors text-white";
      case "success":
        return "text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors";
      default:
        return "text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:opacity-90 transition-opacity";
    }
  };

  const timeAgo = email.sentAt ? formatDistanceToNow(new Date(email.sentAt)) + " ago" : "Just now";
  
  // Extract clean email content preview
  const cleanContent = email.content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  const contentPreview = cleanContent.length > 100 ? cleanContent.substring(0, 100) + "..." : cleanContent;

  return (
    <>
      <div className={`p-4 rounded-lg ${getCardStyle()}`} data-testid={`ai-summary-${email.id}`}>
        <div className="flex items-start justify-between mb-3">
          <h4 className={`font-medium text-sm ${variant === "gradient" ? "text-white" : ""}`}>
            {email.subject}
          </h4>
          <span className={`text-xs ${variant === "gradient" ? "opacity-80" : getTextStyle()}`}>
            {timeAgo}
          </span>
        </div>
        <p className={`text-sm mb-3 ${variant === "gradient" ? "opacity-90" : getTextStyle()}`}>
          To: {email.recipient}
        </p>
        <p className={`text-xs mb-3 ${variant === "gradient" ? "opacity-80" : getTextStyle()}`}>
          {contentPreview}
        </p>
        <div className="flex items-center justify-between">
          <span className={`text-xs ${variant === "gradient" ? "opacity-80" : getTextStyle()}`}>
            Ready for AI analysis
          </span>
          <Button 
            size="sm" 
            className={getButtonStyle()}
            onClick={handleViewDetails}
            data-testid={`view-summary-${email.id}`}
          >
            View Details
          </Button>
        </div>
      </div>

      <AISummaryModal
        email={email}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
