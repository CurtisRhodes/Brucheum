using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Brucheum.Api
{
    [EnableCors("*", "*", "*")]
    public class CommonController : ApiController
    {
        [HttpGet]
        public string VerifyConnection()
        {
            string success = "ono";
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    var dbTest = db.Refs.FirstOrDefault();
                    success = "ok";
                }
                timer.Stop();
                //successModel.ReturnValue = timer.Elapsed.ToString();
                //System.Diagnostics.Debug.WriteLine("VerifyConnection took: " + timer.Elapsed);
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpPut]
        public string SendEmail(EmailMessageModel message)
        {
            string success = "";
            try
            {
                using (SmtpClient smtpClient = new SmtpClient("relay-hosting.secureserver.net", 25))
                {
                    MailMessage mailMessage = new MailMessage(message.From, "CurtishRhodes@hotmail.com", message.Subject, message.Message);
                    //MailMessage mailMessage = new MailMessage("info@api.Ogglebooble.com", "CurtishRhodes@hotmail.com", message.Subject, message.Message);
                    mailMessage.IsBodyHtml = true;
                    // "smtp.office365.com, 587"
                    smtpClient.Send(mailMessage);
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }
}