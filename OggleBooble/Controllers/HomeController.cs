using Microsoft.AspNet.SignalR;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Web.Mvc;

namespace OggleBooble
{
    public class HomeController : Controller
    {
        private string apiService = ConfigurationManager.AppSettings["apiService"];
        public ActionResult Index()
        {
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

        public ActionResult Viewer(string folder, string startFile)
        {
            ViewBag.Title = "Slideshow";
            ViewBag.Service = apiService;
            ViewBag.Folder = folder;
            ViewBag.StartFile = startFile;
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

        [HttpPost]
        public JsonResult CreateImagePageStaticFile(staticPageModel staticPage)
        {
            string success = "";
            try
            {
                var articleTagString = "naked women";
                //$('head').append('<meta property="og:description" content="' + beautify(summary.substr(0, 300)) + '" />');
                //$('head').append("<meta property='og:image' content='https://api.curtisrhodes.com/app_data/images/" + articleImageName + "'/>");

                var head = "<head><script src='https://code.jquery.com/jquery-latest.min.js' type = 'text/javascript'></script>" +
                    "<script src = '../Scripts/GlobalFunctions.js'></script>" +
                    "<script src = '../Scripts/ResizeThreeColumnPage.js'></script>" +
                    "<link href = '../Styles/Default.css' rel= 'stylesheet' />" +
                    "<link href = '../Styles/fixedHeader.css' rel= 'stylesheet' />" +
                    "<link href = '../Styles/footer.css' rel= 'stylesheet' />" +
                    "<link href = '../Styles/ImagePage.css' rel= 'stylesheet' />" +
                    "<meta name = 'Title' content = " + staticPage.Filename + " property= 'og:title' />" +
                    "<meta property = 'og:type' content = 'website' />" +
                    "<meta property = 'og:url' content = 'https://OggleBooble.com/static_pages/" + staticPage.Filename + "' />" +
                    "<meta name = 'Keywords' content = '" + articleTagString + "' />" +
                    "</head>";

                 string staticContent =
                    "<!DOCTYPE html><html>" + head + "<body style='margin-top:105px'>" + staticPage.Html
                     + "<script src='../Scripts/ImagePage.js'></script>"
                     + "<script>$('.thumbImage').click(function() { showViewer($(this).attr('id'));});"
                     + " var imageArray=" + staticPage.ImageArray + "</script></body></html>";

                string filePath = Server.MapPath("~/Static_Pages");
                using (var staticFile = System.IO.File.Open(filePath + "/" + staticPage.Filename, FileMode.Create))
                {
                    Byte[] byteArray = System.Text.Encoding.ASCII.GetBytes(staticContent);
                    staticFile.Write(byteArray, 0, byteArray.Length);
                }
                success = "ok";
            }
            catch (Exception e) { success = Helpers.ErrorDetails(e); }
            return Json(success, JsonRequestBehavior.AllowGet);
        }
    }
    public class staticPageModel
    {
        public string Html { get; set; }
        public string Filename { get; set; }
        public string ImageArray { get; set; }
    }

    public class ErrorController : Controller
    {
        public ViewResult Index()
        {
            Exception x = HttpContext.Server.GetLastError();
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

    public class TestController : Controller
    {
        private string apiService = ConfigurationManager.AppSettings["apiService"];

        public ActionResult contextTest()
        {
            ViewBag.Service = apiService;
            return View();
        }
    }

    public class EmailController : Controller
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