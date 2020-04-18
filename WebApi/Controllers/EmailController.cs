using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Models;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class GodaddyEmailController : ApiController
    {
        [HttpGet]
        public string SendEmail(string subject, string message)
        {
            string success = "";
            try
            {
                //using (SmtpClient smtpClient = new SmtpClient("smtpout.secureserver.net", 587))
                //{
                //    Credentials = new NetworkCredential("curtis.rhodes@gmail.com", "R@quel11"),
                //    EnableSsl = true
                //})o
                //using (SmtpClient smtpClient = new SmtpClient("relay-hosting.secureserver.net", 25))
                //using (SmtpClient smtpClient = new SmtpClient("outlook.office365.com", 587))
                //using (SmtpClient smtpClient = new SmtpClient("smtp.office365.com", 587) {
                //SmtpClient smtpClient = new SmtpClient("smtp.office365.com", 587);
                //smtpClient.Credentials = new NetworkCredential("info@curtisrhodes.com", "R@quel11");
                //smtpClient.EnableSsl = true;

                if (HttpContext.Current.Request.IsLocal)
                {
                    using (SmtpClient smtpClient = new SmtpClient("smtp.office365.com", 587)
                    {
                        Credentials = new NetworkCredential("info@curtisrhodes.com", "R@quel11"),
                        EnableSsl = true
                    })
                    {
                        MailMessage mailMessage = new MailMessage("CurtishRhodes@hotmail.com", "info@curtisrhodes.com",  "(local) " + subject, message);
                        mailMessage.IsBodyHtml = true;
                        smtpClient.Send(mailMessage);
                        success = "ok";
                    }
                }
                else
                {
                    using (SmtpClient smtpClient = new SmtpClient("relay-hosting.secureserver.net", 25))
                    {
                        //MailMessage mailMessage = new MailMessage("info@curtisrhodes.com", "info@curtisrhodes.com", subject, message);
                        MailMessage mailMessage = new MailMessage("curtis.rhodes@gmail.com", "info@curtisrhodes.com", subject, message);
                        mailMessage.IsBodyHtml = true;
                        smtpClient.Send(mailMessage);
                        success = "ok";
                    }
                }
                //MailMessage mailMessage = new MailMessage("info@curtisrhodes.com", "nitesh8266@godaddy.com", subject, message);

                //smtpClient.Send("curtis.rhodes@gmail.com", "curtis.rhodes@gmail.com", emailMessage.Subject, emailMessage.Body);
                //using (SmtpClient smtp = new SmtpClient("smtpout.secureserver.net", 25))
                //using (SmtpClient smtp = new SmtpClient("relay-hosting.secureserver.net", 25))
                //using (SmtpClient smtp = new SmtpClient("relay-hosting.secureserver.net", 25))
                //using (SmtpClient smtp = new SmtpClient("smtpout.secureserver.net", 587))
                //{
                //    MailMessage mailMessage = new MailMessage("info@curtisrhodes.com", "CurtishRhodes@hotmail.com", subject, message);
                //    mailMessage.IsBodyHtml = true;
                //    smtp.Send(mailMessage);
                //    success = "ok";
                //}
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        //public string SendWithHotMail(EmailMessageModel emailMessage) {
        //    string success = "";
        //    try
        //    {
        //        using (SmtpClient smtp = new SmtpClient("smtp.live.com", 25))
        //        {
        //            //smtp.Send("info@curtisrhodes.com", "Curtis.Rhodes@hotmail.com", emailMessage.Subject, emailMessage.Body);

        //            var mail = new MailMessage();
        //            mail.From = new MailAddress("curtishrhodes@hotmail.com");
        //            mail.To.Add("curtis.rhodes@gmail.com");
        //            mail.Subject = emailMessage.Subject;
        //            mail.IsBodyHtml = true;
        //            mail.Body = emailMessage.Body;

        //            smtp.UseDefaultCredentials = false;
        //            smtp.Credentials = new System.Net.NetworkCredential("curtishrhodes@hotmail.com", "R@quel11");
        //            smtp.EnableSsl = true;


        //            smtp.Send(mail);
        //            success = "ok";
        //        }
        //    }
        //    catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
        //    return success;
        //}

        //public string SendWithGmail(EmailMessageModel emailMessage)
        //{
        //    string success = "";
        //    try
        //    {
        //        var client = new SmtpClient("smtp.gmail.com", 587)
        //        {
        //            Credentials = new NetworkCredential("curtis.rhodes@gmail.com", "R@quel11"),
        //            EnableSsl = true
        //        };
        //        //client.Send("curtis.rhodes@gmail.com", "curtishrhodes@ghotmail.com", emailMessage.Subject, emailMessage.Body);
        //        MailMessage mailMessage = new MailMessage("info@curtisrhodes.com", "CurtishRhodes@hotmail.com", emailMessage.Subject, emailMessage.Body);
        //        client.Send(mailMessage);
        //        success = "ok";
        //    }
        //    catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
        //    return success;
        //}





        //[HttpPost]
        //public async Task Post(EmailMessageModel emailMessage)
        //{
        //    //await Task.WhenAll(Send("Curtis.Rhodes@hotmail.com"), Send("Curtis.Rhodes@hotmail.com"));
        //    await Task.WhenAll(Send(emailMessage, "Curtis.Rhodes@hotmail.com"), Send(emailMessage, "Curtis.Rhodes@hotmail.com"));
        //}


        //public async Task Send(EmailMessageModel emailMessage, string to)
        //{
        //    string success = "";
        //    try
        //    {
        //        using (SmtpClient smtp = new SmtpClient("relay-hosting.secureserver.net", 25))
        //        {
        //            string userState = "test message1";
        //            smtp.SendAsync("info@curtisrhodes.com", to, emailMessage.Subject, emailMessage.Body, userState)
        //            //smtp.SendAsync("info@curtisrhodes.com", "Curtis.Rhodes@hotmail.com", emailMessage.Subject, emailMessage.Body);
        //            //await smtp.SendCompleted += new SendCompletedEventHandler(SendCompleteCallback);
        //            await Task.Delay(100);
        //        }
        //    }
        //    catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
        //}



        //public event SendCompletedEventHandler SendCompleted;

        //private static void SendCompleteCallback(object sender, System.ComponentModel.AsyncCompletedEventArgs e)
        //{
        //    string token = (string)e.UserState;
        //}

        //[HttpGet]
        //public HttpResponseMessage Subscribe(HttpRequestMessage request)
        //{
        //    var response = request.CreateResponse();
        //    return response;
        //}
    }
}
