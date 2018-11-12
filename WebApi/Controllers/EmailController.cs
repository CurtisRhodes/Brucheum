using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Web.Http;
using System.Web.Http.Cors;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class EmailController : ApiController
    {
        [HttpPost]
        public string Send(EmailMessage emailMessage)
        {
            string success = "";
            try
            {
                SmtpClient smtp = new SmtpClient("relay-hosting.secureserver.net", 25);
                MailMessage mailMessage = new MailMessage("info@curtisrhodes.com", "Curtishrhodes@hotmail.com");
                mailMessage.Subject = emailMessage.Subject;
                mailMessage.Body = emailMessage.Body;
                smtp.Send(mailMessage);
                success = "ok";
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    public class EmailMessage
    {
        public string Subject { get; set; }
        public string Body { get; set; }
    }

}
