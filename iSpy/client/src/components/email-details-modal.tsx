import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Email } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Sparkles, Mail, Clock, Eye, X } from "lucide-react";
import { useState } from "react";

interface EmailDetailsModalProps {
  email: Email | null;
  isOpen: boolean;
  onClose: () => void;
}

interface AISummary {
  title: string;
  content: string;
  priority: "urgent" | "normal" | "low";
  keyPoints: string[];
}

export function EmailDetailsModal({ email, isOpen, onClose }: EmailDetailsModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<AISummary | null>(null);

  if (!email) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "read":
        return <Badge variant="default" className="bg-green-100 text-green-800">Read</Badge>;
      case "pending":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Sent</Badge>;
      default:
        return <Badge variant="secondary">Unread</Badge>;
    }
  };

  const getReadTime = () => {
    if (email.readStatus === "read" && email.readAt) {
      return `Read ${formatDistanceToNow(new Date(email.readAt))} ago`;
    }
    if (email.readStatus === "pending") {
      return "Tracking opens...";
    }
    return "No activity";
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/summaries/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: [{
            subject: email.subject,
            content: email.content,
            sender: email.recipient, // treating recipient as sender for summary context
            timestamp: email.sentAt || new Date().toISOString()
          }]
        })
      });

      if (response.ok) {
        const result = await response.json();
        setSummary({
          title: result.title,
          content: result.content,
          priority: result.priority || 'normal',
          keyPoints: []
        });
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
    }
    setIsGenerating(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-600 bg-red-50";
      case "low": return "text-gray-600 bg-gray-50"; 
      default: return "text-blue-600 bg-blue-50";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Details
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Email Header */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-lg">{email.recipient}</span>
                {getStatusBadge(email.readStatus)}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {email.sentAt ? formatDistanceToNow(new Date(email.sentAt)) + " ago" : "Just now"}
              </div>
            </div>
            
            <h3 className="text-xl font-medium mb-2">{email.subject}</h3>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {getReadTime()}
              </div>
              {email.openCount !== undefined && (
                <span>Opens: {email.openCount}</span>
              )}
            </div>
          </div>

          {/* Email Content */}
          <div className="space-y-4">
            <h4 className="font-semibold">Email Content:</h4>
            <div className="bg-white border rounded-lg p-4 max-h-60 overflow-y-auto">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: email.content.replace(/\n/g, '<br>') }}
              />
            </div>
          </div>

          {/* AI Summary Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                AI Summary
              </h4>
              {!summary && (
                <Button 
                  onClick={handleGenerateSummary}
                  disabled={isGenerating}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isGenerating ? "Generating..." : "Generate Summary"}
                </Button>
              )}
            </div>

            {summary ? (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-lg">{summary.title}</h5>
                  <Badge className={`text-xs ${getPriorityColor(summary.priority)}`}>
                    {summary.priority}
                  </Badge>
                </div>
                <div 
                  className="text-sm text-gray-700 whitespace-pre-line leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: summary.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/• /g, '• ') }}
                />
                <div className="flex justify-end mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSummary(null)}
                    className="flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </Button>
                </div>
              </div>
            ) : (
              !isGenerating && (
                <div className="text-center py-6 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Click "Generate Summary" to get AI insights about this email</p>
                  <p className="text-sm">Perfect for analyzing resumes, recruiter messages, and more</p>
                </div>
              )
            )}

            {isGenerating && (
              <div className="text-center py-6">
                <div className="inline-flex items-center gap-2 text-blue-600">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full"></div>
                  Analyzing email content...
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}