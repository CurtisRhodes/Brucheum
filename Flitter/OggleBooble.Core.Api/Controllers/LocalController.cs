using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using OggleBooble.Core.Api.DataContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using System.Web.Http.Results;

namespace OggleBooble.Core.Api.Controllers
{
    //[Route("api/[controller]")]
    //[ApiController]
    public class LocalController : Controller
    {
        private IHostEnvironment _env;
        public LocalController(IHostEnvironment env)
        {
            _env = env;
        }

        [HttpGet]
        [Route("Local/GetBuildInfo")]
        public string GetBuildInfo()
        {
            string lastBuild = "11:11";
            string path = System.IO.Path.Combine(_env.ContentRootPath, @"bin\Release\netcoreapp3.1\OggleBooble.Core.Api.exe");
            // C:\Users\curti\source\repos\CurtisRhodes\Brucheum\Flitter\OggleBooble.Core.Api
            // \bin\Release\netcoreapp3.1\OggleBooble.Core.Api.exe

            if (System.IO.File.Exists(path))
            {
                lastBuild = System.IO.File.GetLastWriteTime(path).ToShortDateString() + " :" + System.IO.File.GetLastWriteTime(path).ToShortTimeString();
            }
            return lastBuild;
        }

        [HttpGet]
        public string SendEmail(string subject, string message)
        {
            string success = "";
            try
            {
                if (_env.IsProduction())
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
                        success = "ok local";
                    }
                }
                else
                {
                    using (SmtpClient smtpClient = new SmtpClient("relay-hosting.secureserver.net", 25))
                    {
                        MailMessage mailMessage = new MailMessage("info@api.Ogglebooble.com", "CurtishRhodes@hotmail.com", subject, message);
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

        //[HttpGet("{parent}")]
        [Route("Local/MySqlTest")]
        //[Route("Local/MySqlTest/{id}")]
        public TestResults MySqlTest(int parent)
        {
            var testResults = new TestResults();
            using (var db = new OggleBoobleMySqlContext())
            {
                List<CategoryFolder> categoryFolders = db.CategoryFolders.Where(f => f.Parent == parent).ToList();
                foreach (var categoryFolder in categoryFolders)
                {
                    testResults.Items.Add(new TestResultsItem() { Id = categoryFolder.Id, FolderName = categoryFolder.FolderName });
                }
                testResults.Success = "ok";
            }
            return testResults;
        }

    }
    public class TestResults
    {
        public TestResults()
        {
            Items = new List<TestResultsItem>();
        }
        public string Success { get; set; }
        public List<TestResultsItem> Items { get; set; }
    }
    public class TestResultsItem
    {
        public int Id { get; set; }
        public string FolderName { get; set; }
    }

}
