import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Paperclip, Image, Clock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Compose() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    recipient: "",
    subject: "",
    content: "",
    trackOpens: true,
    trackClicks: true,
    aiSummary: false,
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/emails", data);
    },
    onSuccess: () => {
      toast({
        title: "Email Sent Successfully",
        description: "Your email has been sent with read tracking enabled.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      // Reset form
      setFormData({
        recipient: "",
        subject: "",
        content: "",
        trackOpens: true,
        trackClicks: true,
        aiSummary: false,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.recipient || !formData.subject || !formData.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    sendEmailMutation.mutate({
      recipient: formData.recipient,
      subject: formData.subject,
      content: formData.content,
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon" data-testid="back-to-dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h2 className="text-2xl font-bold">Compose Email</h2>
                <p className="text-muted-foreground">Send emails with advanced tracking</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Read tracking enabled</span>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-4xl mx-auto">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Recipient */}
              <div className="space-y-2">
                <Label htmlFor="recipient">To *</Label>
                <Input
                  id="recipient"
                  type="email"
                  placeholder="recipient@example.com"
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  required
                  data-testid="input-recipient"
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Email subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  data-testid="input-subject"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="content">Message *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your message..."
                  rows={12}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  className="resize-none"
                  data-testid="textarea-content"
                />
              </div>

              {/* Tracking Options */}
              <Card className="p-4 bg-muted/30">
                <h4 className="font-medium mb-3">Tracking & AI Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="track-opens"
                      checked={formData.trackOpens}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, trackOpens: !!checked })
                      }
                      data-testid="checkbox-track-opens"
                    />
                    <Label htmlFor="track-opens" className="text-sm">Track email opens</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="track-clicks"
                      checked={formData.trackClicks}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, trackClicks: !!checked })
                      }
                      data-testid="checkbox-track-clicks"
                    />
                    <Label htmlFor="track-clicks" className="text-sm">Track link clicks</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ai-summary"
                      checked={formData.aiSummary}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, aiSummary: !!checked })
                      }
                      data-testid="checkbox-ai-summary"
                    />
                    <Label htmlFor="ai-summary" className="text-sm">Generate AI summary for replies</Label>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center space-x-4">
                  <Button type="button" variant="ghost" size="icon" title="Attach file" data-testid="button-attach">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" title="Insert image" data-testid="button-image">
                    <Image className="w-5 h-5" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" title="Schedule send" data-testid="button-schedule">
                    <Clock className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex items-center space-x-3">
                  <Button 
                    type="button" 
                    variant="ghost"
                    data-testid="button-save-draft"
                  >
                    Save Draft
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={sendEmailMutation.isPending}
                    data-testid="button-send-email"
                  >
                    {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
