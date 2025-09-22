import { randomUUID } from "crypto";

export interface TrackingPixelData {
  pixelId: string;
  pixelUrl: string;
  pixelHtml: string;
}

export function generateTrackingPixel(baseUrl: string): TrackingPixelData {
  const pixelId = randomUUID();
  const pixelUrl = `${baseUrl}/api/track/${pixelId}`;
  const pixelHtml = `<img src="${pixelUrl}" width="1" height="1" style="display:none;" alt="" />`;

  return {
    pixelId,
    pixelUrl,
    pixelHtml
  };
}

export function embedTrackingInEmail(emailContent: string, trackingPixel: string): string {
  // Insert tracking pixel at the end of the email body
  const trackingPixelHtml = `<div style="display:none;">${trackingPixel}</div>`;
  
  if (emailContent.includes('</body>')) {
    return emailContent.replace('</body>', `${trackingPixelHtml}</body>`);
  } else if (emailContent.includes('</html>')) {
    return emailContent.replace('</html>', `${trackingPixelHtml}</html>`);
  } else {
    // Plain text or simple HTML
    return `${emailContent}${trackingPixelHtml}`;
  }
}

export function generateReadReceiptNotification(email: any, readTime?: number): string {
  const timeAgo = new Date().toLocaleString();
  const readDuration = readTime ? `Reading time: ${Math.floor(readTime / 60)}m ${readTime % 60}s` : '';
  
  return `${email.recipient} just read your "${email.subject}" email. ${readDuration}`.trim();
}
