import nodemailer from "nodemailer";

export const sendEmail = async (emailId, subject, msg, url) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    to: emailId,
    subject: subject,
    text: `${msg} \n\n ${url}`,
  });
};
