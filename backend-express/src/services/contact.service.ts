import transporter from "../config/email.js";

const sendEmail = ({ name, sender, object, message, html }: any) => {
  return transporter.sendMail({
    from: process.env.MAIL_USER,
    to: process.env.MAIL_TO,
    subject: name + " vous a contacté via le formulaire de votre portfolio",
    text:
      "subject : " + object + "\n\n" + message + "\n\n" + "email : " + sender,
    html: "subject : " + object + "\n\n" + html + "\n\n" + "email : " + sender,
  });
};
export default sendEmail;
