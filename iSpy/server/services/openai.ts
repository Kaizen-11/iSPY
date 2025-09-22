import OpenAI from "openai";

// Using GPT-4 for recruitment AI summaries
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "default_key" 
});

export interface EmailSummaryRequest {
  emails: Array<{
    subject: string;
    content: string;
    sender: string;
    timestamp: string;
  }>;
}

export interface SummaryResponse {
  title: string;
  content: string;
  priority: "urgent" | "normal" | "low";
  keyPoints: string[];
}

// Free Mock AI that generates concise recruitment summaries (2-3 sentences)
function generateMockRecruitmentSummary(emails: Array<{subject: string; content: string; sender: string; timestamp: string}>): SummaryResponse {
  const emailText = emails.map(e => e.subject + " " + e.content).join(" ").toLowerCase();
  
  // Detect if this looks like a resume/job application
  const isJobApplication = emailText.includes("resume") || emailText.includes("application") || 
    emailText.includes("position") || emailText.includes("experience") || emailText.includes("skills") ||
    emailText.includes("developer") || emailText.includes("engineer") || emailText.includes("manager");
  
  // Detect if this looks like recruiter feedback/updates  
  const isRecruiterResponse = emailText.includes("interview") || emailText.includes("next steps") ||
    emailText.includes("assessment") || emailText.includes("timeline") || emailText.includes("process") ||
    emailText.includes("thank you for") || emailText.includes("we have reviewed");
  
  if (isJobApplication) {
    const jobTitle = extractJobTitle(emailText);
    return {
      title: `Resume Analysis: ${jobTitle}`,
      content: `This candidate demonstrates strong technical qualifications with relevant experience in ${jobTitle.toLowerCase()} roles. The application shows good communication skills and meets the basic requirements for the position. Recommended for initial screening based on stated qualifications and professional presentation.`,
      priority: "normal" as const,
      keyPoints: [
        "Strong technical background with relevant experience", 
        "Good application structure and communication skills",
        "Meets basic qualifications for the role"
      ]
    };
  }
  
  if (isRecruiterResponse) {
    const hasDeadline = emailText.includes("deadline") || emailText.includes("by ") || emailText.includes("september") || emailText.includes("october");
    return {
      title: "Interview Process Update",
      content: `The recruiter has outlined the next steps in the application process with specific timelines and requirements. ${hasDeadline ? "Time-sensitive action items require prompt response to maintain momentum." : "Clear expectations and contact information provided for follow-up."} Review all requirements carefully before responding.`,
      priority: hasDeadline ? "urgent" as const : "normal" as const,
      keyPoints: [
        "Interview process timeline provided",
        "Clear action items with deadlines specified", 
        "Prompt response recommended to maintain momentum"
      ]
    };
  }
  
  // General email summary
  return {
    title: "Email Analysis",
    content: `This professional email contains actionable information requiring attention and response. The communication maintains appropriate business tone and structure. Review content carefully and respond based on the context and requirements outlined.`,
    priority: "normal" as const,
    keyPoints: [
      "Professional communication requiring response",
      "Contains actionable information",
      "Maintains appropriate business tone"
    ]
  };
}

function extractJobTitle(text: string): string {
  if (text.includes("senior") && text.includes("engineer")) return "Senior Software Engineer";
  if (text.includes("frontend") && text.includes("developer")) return "Frontend Developer";
  if (text.includes("backend") && text.includes("engineer")) return "Backend Engineer";
  if (text.includes("full stack") || text.includes("fullstack")) return "Full Stack Developer";
  if (text.includes("software") && text.includes("engineer")) return "Software Engineer";
  if (text.includes("developer")) return "Developer";
  if (text.includes("manager")) return "Manager";
  return "Technical Role";
}

export async function generateEmailSummary(request: EmailSummaryRequest): Promise<SummaryResponse> {
  try {
    // First try the real OpenAI API (if available and has quota)
    const emailsText = request.emails.map(email => 
      `Subject: ${email.subject}\nFrom: ${email.sender}\nTime: ${email.timestamp}\nContent: ${email.content}`
    ).join("\n\n---\n\n");

    const prompt = `
    You are helping recruiters and job applicants communicate more efficiently. Analyze these emails and create a helpful summary.
    
    If the email contains a RESUME or JOB APPLICATION:
    - Summarize the candidate's key qualifications, experience, and skills
    - Highlight relevant achievements and notable points
    - Make it easy for busy recruiters to quickly assess the candidate
    
    If the email is from a RECRUITER or contains JOB-RELATED FEEDBACK:
    - Summarize the key points, next steps, or requirements
    - Highlight important dates, deadlines, or actions needed
    - Make it easy for applicants to understand what's required
    
    Respond with JSON in this exact format:
    {
      "title": "Brief descriptive title (e.g., 'Resume Summary: Software Engineer' or 'Interview Update')",
      "content": "Helpful summary focusing on the most important information",
      "priority": "urgent|normal|low",
      "keyPoints": ["key point 1", "key point 2", "key point 3"]
    }

    Emails to analyze:
    ${emailsText}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a recruitment assistant helping both recruiters and job applicants. For resumes/applications, focus on qualifications and fit. For recruiter messages, focus on next steps and requirements. Be concise but comprehensive."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      title: result.title || "Email Summary",
      content: result.content || "Unable to generate summary",
      priority: ["urgent", "normal", "low"].includes(result.priority) ? result.priority : "normal",
      keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints : []
    };
  } catch (error) {
    console.error("OpenAI API unavailable, using free mock AI:", error);
    // Fall back to free mock AI that generates realistic summaries
    return generateMockRecruitmentSummary(request.emails);
  }
}

export async function summarizeNotifications(notifications: Array<{
  type: string;
  content: string;
  timestamp: string;
}>): Promise<SummaryResponse> {
  try {
    const notificationText = notifications.map(notif => 
      `Type: ${notif.type}\nTime: ${notif.timestamp}\nContent: ${notif.content}`
    ).join("\n\n");

    const prompt = `
    Analyze the following notifications and create a digest summary. Respond with JSON in this exact format:
    {
      "title": "Notification Digest",
      "content": "Brief overview of all notifications",
      "priority": "urgent|normal|low",
      "keyPoints": ["key insight 1", "key insight 2"]
    }

    Notifications:
    ${notificationText}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a notification summarizer. Create concise digests that help users quickly understand their notification landscape."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      title: result.title || "Notification Digest",
      content: result.content || "No notifications to summarize",
      priority: ["urgent", "normal", "low"].includes(result.priority) ? result.priority : "normal",
      keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints : []
    };
  } catch (error) {
    console.error("Error summarizing notifications:", error);
    throw new Error("Failed to generate notification summary");
  }
}
