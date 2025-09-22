const nodemailer = require("nodemailer");

// create transporter with Gmail
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS, // Gmail App Password (16 chars)
  },
});

async function send() {
  try {
    let info = await transporter.sendMail({
      from: `"iSpy" <${process.env.EMAIL_USER}>`,
      to: "recipient@example.com",   // 👈 replace with your test email
      subject: "Hello from iSpy",
      text: "This is a test email sent from Replit using Gmail + Nodemailer 🚀",
    });

    console.log("✅ Email sent:", info.response);
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

send();
