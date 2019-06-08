using Microsoft.AspNet.SignalR;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
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
        private readonly string apiService = ConfigurationManager.AppSettings["apiService"];
        public ActionResult Index()
        {
            //Version version = System.Reflection.Assembly.GetExecutingAssembly().GetName().Version;
            //DateTime buildDate = new DateTime(2000, 1, 1).AddDays(version.Build).AddSeconds(version.Revision * 2);


            //$('#footerVersion').htm();





            //version.
            //= ("1.1.*.*");    build: 6.06.339
            //[assembly: AssemblyVersion("1.0.0.0")]
            //[assembly: AssemblyFileVersion("1.0.0.0")]

            //< major version >.< minor version >.< build number >.< revision >

            ///The default build number increments daily. 
            ///The default revision number is the number of seconds since midnight local time
            ///(without taking into account time zone adjustments for daylight saving time), divided by 2.



            string userName = "";
            if (User.Identity.IsAuthenticated)
            {
                userName = User.Identity.Name;
            }
            else
            {
                userName = Request.UserHostAddress;
                //userName = Request.ServerVariables["HTTP_X_FORWARDED_FOR"];
                if (string.IsNullOrEmpty(userName))
                {
                    userName = Request.ServerVariables["REMOTE_ADDR"];
                }

            }
            ViewBag.BuildInfo = System.Reflection.Assembly.GetExecutingAssembly().GetAssemblyInfo();
            ViewBag.UserName = userName;
            ViewBag.IsPornEditor = User.IsInRole("Porn Editor");
            ViewBag.Service = apiService;
            return View();
        }

        //public ActionResult Viewer(string folder, string startFile)
        //{
        //    ViewBag.Title = "Slideshow";
        //    ViewBag.Service = apiService;
        //    ViewBag.Folder = folder;
        //    ViewBag.StartFile = startFile;
        //    return View();
        //}

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
        public JsonResult CreateImagePageStaticFile(StaticPageModel staticPage)
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

        public string GetStaticPage(string fileName )
        {
            string rtn = "";
            string fullPath = Server.MapPath("~/Static_Pages") + "\\" + fileName;
            if ( System.IO.File.Exists(fullPath))
            {
                rtn = fullPath;
            }
            return rtn;
        }
    }
    public class StaticPageModel
    {
        public string Html { get; set; }
        public string Filename { get; set; }
        public string ImageArray { get; set; }
    }

    public class ErrorController : Controller
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

    public class TestController : Controller
    {
        private readonly string apiService = ConfigurationManager.AppSettings["apiService"];

        public ActionResult ContextTest()
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