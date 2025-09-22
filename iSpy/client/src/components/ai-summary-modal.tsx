import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Email } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";

interface AISummaryModalProps {
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

export function AISummaryModal({ email, isOpen, onClose }: AISummaryModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<AISummary | null>(null);

  if (!email) return null;

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
            sender: email.recipient,
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            AI Email Summary
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Email Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{email.recipient}</span>
              <span className="text-xs text-muted-foreground">
                {email.sentAt ? formatDistanceToNow(new Date(email.sentAt)) + " ago" : "Just now"}
              </span>
            </div>
            <h3 className="font-medium text-sm text-gray-900 mb-2">{email.subject}</h3>
            <p className="text-sm text-gray-600 line-clamp-3">
              {email.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
            </p>
          </div>

          {/* AI Summary Section */}
          {!summary && !isGenerating && (
            <div className="text-center py-6">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50 text-blue-500" />
              <p className="text-muted-foreground mb-4">Generate AI insights for this email</p>
              <Button 
                onClick={handleGenerateSummary}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Summary
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-6">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <div className="animate-spin w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full"></div>
                Analyzing email content...
              </div>
            </div>
          )}

          {summary && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-lg">{summary.title}</h5>
                <Badge className={`text-xs ${getPriorityColor(summary.priority)}`}>
                  {summary.priority}
                </Badge>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {summary.content}
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-blue-600">AI-powered recruitment analysis</span>
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}