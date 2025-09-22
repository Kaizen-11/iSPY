import { Email } from "@shared/schema";
import { BarChart3, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EmailDetailsModal } from "./email-details-modal";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface EmailListProps {
  emails: Email[];
  isLoading?: boolean;
}

export function EmailList({ emails, isLoading }: EmailListProps) {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmail(null);
  };
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-start space-x-4 p-4 animate-pulse">
            <div className="w-3 h-3 rounded-full bg-muted"></div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
              <div className="h-4 bg-muted rounded w-48"></div>
              <div className="flex space-x-4">
                <div className="h-5 bg-muted rounded w-12"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No emails sent yet.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "read": return "status-read";
      case "pending": return "status-pending";
      default: return "status-unread";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "read": 
        return <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Read</span>;
      case "pending":
        return <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Sent</span>;
      default:
        return <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Unread</span>;
    }
  };

  const getReadTime = (email: Email) => {
    if (email.readStatus === "read" && email.readAt) {
      return `Read ${formatDistanceToNow(new Date(email.readAt))} ago`;
    }
    if (email.readStatus === "pending") {
      return "Sent successfully - tracking opens";
    }
    return "No activity";
  };

  return (
    <>
      <div className="space-y-4">
        {emails.map((email) => (
          <div 
            key={email.id} 
            className="flex items-start space-x-4 p-4 hover:bg-accent rounded-lg transition-colors cursor-pointer"
            data-testid={`email-item-${email.id}`}
            onClick={() => handleEmailClick(email)}
          >
            <div className="flex-shrink-0">
              <div className={`w-3 h-3 rounded-full read-status-dot ${getStatusColor(email.readStatus)}`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate" data-testid={`email-recipient-${email.id}`}>
                  {email.recipient}
                </p>
                <span className="text-xs text-muted-foreground" data-testid={`email-time-${email.id}`}>
                  {email.sentAt ? formatDistanceToNow(new Date(email.sentAt)) + " ago" : "Just now"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 truncate" data-testid={`email-subject-${email.id}`}>
                {email.subject}
              </p>
              <div className="flex items-center mt-2 space-x-4">
                {getStatusBadge(email.readStatus)}
                <span className="text-xs text-muted-foreground">
                  {getReadTime(email)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEmailClick(email);
                }}
                data-testid={`view-email-${email.id}`}
              >
                <Eye className="w-4 h-4" />
                View Details
              </Button>
              <button 
                className="text-muted-foreground hover:text-foreground"
                data-testid={`email-analytics-${email.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <EmailDetailsModal
        email={selectedEmail}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
