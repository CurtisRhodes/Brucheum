using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Web.Http;
using System.Web.Http.Cors;

namespace WebApi.Controllers
{
    [EnableCors("*", "*", "*")]
    public class EmailController : ApiController
    {
        [HttpGet]
        public string SendEmail(string subjectLine, string message)
        {
            string success = "";
            try
            {
                SmtpClient smtp = new SmtpClient("relay-hosting.secureserver.net", 25);
                MailMessage mailMessage = new MailMessage("info@curtisrhodes.com", "Curtishrhodes@hotmail.com");
                mailMessage.Subject = subjectLine;
                mailMessage.Body = message;
                smtp.Send(mailMessage);
                success = "ok";
            }
            catch (Exception ex) { success = ex.Message; }
            return success;
        }
    }
}
