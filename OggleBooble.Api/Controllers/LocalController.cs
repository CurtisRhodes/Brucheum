using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Net.Mail;
using System.Web;
using System.Web.Http.Results;
using OggleBooble.Api.Models;
using OggleBooble.Api.MsSqlDataContext;

namespace OggleBooble.Api.Controllers
{
    public class LocalController : ApiController
    {
        [HttpGet]
        public string GetBuildInfo()
        {
            string lastBuild = "11:11";
            string path = System.Web.HttpContext.Current.Server.MapPath("~/bin/OggleBooble.Api.dll");
            if (System.IO.File.Exists(path))
            {
                lastBuild = System.IO.File.GetLastWriteTime(path).ToShortDateString();
            }
            return lastBuild;
        }

        [HttpGet]
        public string SendEmail(string subject, string message)
        {
            string success = "";
            try
            {
                if (HttpContext.Current.Request.IsLocal)
                {
                    using (SmtpClient smtpClient = new SmtpClient("smtp.office365.com", 587)
                    {
                        Credentials = new NetworkCredential("info@curtisrhodes.com", "R@quel11"),
                        EnableSsl = true
                    })
                    {
                        MailMessage mailMessage = new MailMessage("info@curtisrhodes.com", "CurtishRhodes@hotmail.com", "(local) " + subject, message);
                        mailMessage.IsBodyHtml = true;
                        smtpClient.Send(mailMessage);
                        success = "ok";
                    }
                }
                else
                {
                    using (SmtpClient smtpClient = new SmtpClient("relay-hosting.secureserver.net", 25))
                    {
                        MailMessage mailMessage = new MailMessage("info@curtisrhodes.com", "info@curtisrhodes.com", subject, message);
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

        [HttpGet]
        public JsonResult<TestResults> MsSqlTest(int parent)
        {
            var testResults = new TestResults();
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                List<CategoryFolder> categoryFolders = db.CategoryFolders.Where(f => f.Parent == parent).ToList();
                foreach (CategoryFolder categoryFolder in categoryFolders)
                {
                    testResults.Items.Add(new TestResultsItem() { Id = categoryFolder.Id, FolderName = categoryFolder.FolderName });
                }
                testResults.Success = "ok";
            }
            return Json(testResults);
        }

    }
}
