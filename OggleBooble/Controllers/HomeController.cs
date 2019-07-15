using Microsoft.AspNet.SignalR;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace OggleBooble
{
    public class LogVisitModel
    {
        public string IpAddress { get; set; }
        public string UserName { get; set; }
        public string AppName { get; set; }
    }

    public class HomeController : Controller
    {
        private readonly string apiService = ConfigurationManager.AppSettings["apiService"];
        public ActionResult Index()
        {
            string ipAddress = Helpers.GetIPAddress();
            if (Session["userName"] == null)
            {
                if (User.Identity.Name == null)
                    Session["userName"] = ipAddress;
                else
                    Session["userName"] = User.Identity.Name;
                Session["IpAddress"] = ipAddress;
                //LogVisit();
            }

            GetBuildInfo();

            ViewBag.BuildInfo = GetBuildInfo();
            ViewBag.UserName = User.Identity.Name;
            ViewBag.IpAddress = Session["IpAddress"];
            ViewBag.IsPornEditor = User.IsInRole("Porn Editor");
            ViewBag.Service = apiService;
            return View();
        }

        public ActionResult ImagePage(string folder)
        {
            if (folder == null)
                return RedirectToAction("Index");

            ViewBag.Title = folder.Substring(folder.LastIndexOf("/") + 1);
            ViewBag.IsPornEditor = User.IsInRole("Porn Editor");
            ViewBag.Service = apiService;
            ViewBag.IpAddress = Helpers.GetIPAddress();
            ViewBag.Folder = folder;
            return View();
        }
        public ActionResult Transitions(string folder)
        {
            ViewBag.Folder = folder;
            ViewBag.Service = apiService;
            return View();
        }

        public ActionResult BoobsRanker()
        {
            ViewBag.UserName = Session["userName"];
            ViewBag.Service = apiService;
            return View();
        }

        public ActionResult Videos()
        {
            ViewBag.Service = apiService;
            return View();
        }

        public ActionResult Mobile(string folder)
        {
            ViewBag.Folder = folder;
            ViewBag.Service = apiService;
            return View();
        }

        private string GetBuildInfo()
        {
            string lastBuild = "11:11";
            string path = System.Web.HttpContext.Current.Server.MapPath("~/bin/OggleBooble.dll");
            if (System.IO.File.Exists(path))
            {
                lastBuild = System.IO.File.GetLastWriteTime(path).ToShortDateString();
            }
            return lastBuild;
        }
    }

    public class xStaticPageModel
    {
        public string Html { get; set; }
        public string Filename { get; set; }
        public string FolderId { get; set; }
        public string ImageArray { get; set; }
    }

    public class xErrorController : Controller
    {
        public ViewResult Index()
        {
            //Exception x = HttpContext.Server.GetLastError();
            Exception ex = (Exception)Session["LastError"];
            string errorMessage = "unknown error";
            string stackTrace = "";
            if (ex != null)
            {
                errorMessage = ex.Message;
                if (ex.InnerException != null)
                {
                    errorMessage += "<br/>" + ex.InnerException.Message;
                    if (ex.InnerException.InnerException != null)
                        errorMessage += "<br/>" + ex.InnerException.InnerException.Message; ;
                }
                stackTrace = ex.StackTrace.Replace("\r\n", "");
            }
            ViewBag.ErrorMessage = errorMessage;
            ViewBag.StackTrace = stackTrace;
            return View();
        }
    }

    public class xTestController : Controller
    {
        private readonly string apiService = ConfigurationManager.AppSettings["apiService"];

        public ActionResult ContextTest()
        {
            ViewBag.Service = apiService;
            return View();
        }
    }

    public class xEmailController : Controller
    {
        [HttpGet]
        public string SendEmail(string subject, string message)
        {
            string success = "";
            try
            {
                SmtpClient smtpClient = new SmtpClient();
                smtpClient.Host = "relay-hosting.secureserver.net";
                smtpClient.Port = 25;
#if DEBUG
                smtpClient.Host = "smtp.live.com";
                smtpClient.Credentials = new NetworkCredential("curtishrhodes@hotmail.com", "R@quel11");
                smtpClient.EnableSsl = true;
#endif
                smtpClient.Send("curtishrhodes@hotmail.com", "curtishrhodes@hotmail.com", subject, message);

                success = "ok";
            }
            catch (Exception ex)
            {
                success = "this worked locally but, " + Helpers.ErrorDetails(ex);
            }
            return success;
        }

    }

}