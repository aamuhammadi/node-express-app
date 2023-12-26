const { MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE } = require("../config/env");

const Mailjet = require("node-mailjet");
const mailjet = Mailjet.apiConnect(MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE);

const request = mailjet.post("send", { version: "v3.1" }).request({
  Messages: [
    {
      From: {
        Email: "support@aamax.co",
        Name: "AAMAX",
      },
      To: [
        {
          Email: "aamcosultants17@gmail.com",
          Name: "AAM Consultants",
        },
      ],
      Subject: "Welcome to AAMAX",
      TextPart: `Asslamu alaikum`,
      HTMLPart: `<strong>Asslamu alaikum</strong> <p>Welcome to AAMAX</p><h3><a href="/contact">Contact Us</a></h3>`,
    },
  ],
});

request;
