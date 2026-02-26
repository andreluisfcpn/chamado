import nodemailer, { SendMailOptions } from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const sender: string = '"TechSupport" <relage6730@noidos.com>'

interface SendMailProps extends SendMailOptions {
  emailHtml: any
  subject: string
  email: string
}

export const SendEmail = ({ emailHtml, subject, email }: SendMailProps) => ({
  from: sender,
  to: email,
  subject: subject,
  html: emailHtml,
})
