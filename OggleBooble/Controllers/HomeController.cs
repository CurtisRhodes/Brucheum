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
            if (Session["userName"] == null) {
                Session["userName"] = User.Identity.Name;
                Session["IpAddress"] = Helpers.GetIPAddress();
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
            ViewBag.UserName = User.Identity.Name;
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

        //private async Task<string> LogHit()
        private async Task<string> LogVisit()
        {
            string success = "";
            //string apiUrl = "https://api.curtisrhodes.com/";
            string apiUrl = "http://localhost:40395/";
            using (HttpClient client = new HttpClient())
            {
                client.BaseAddress = new Uri(apiUrl);
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

                LogVisitModel visitModel = new LogVisitModel()
                {
                    UserName = "User.Identity.Name",
                    IpAddress = Session["IpAddress"].ToString(),
                    AppName = "OggleBooble"
                };

                var x = new StringContent(visitModel.ToString());

                HttpResponseMessage response = await client.PostAsync("api/HttpClient", x);
                
                success = response.StatusCode.ToString();

                //var stringContent = new FormUrlEncodedContent(new[]{
                //    new KeyValuePair<string, string>("UserName", User.Identity.Name),
                //    new KeyValuePair<string, string>("IpAddress", Session["IpAddress"].ToString()),
                //    new KeyValuePair<string, string>("AppName", "OggleBooble")
                //});

                //HttpResponseMessage response = await client.PostAsync(apiUrl, stringContent);

                //success = response..StatusCode.ToString();

            }
            return success;
        }




        //[HttpGet]
        //public string TryStaticContent(string folderName)
        //{
        //    string success = "";
        //    try
        //    {
        //        //Response.Redirect("http://pages.ogglebooble.com/" + folderName + ".html", true);
        //        success = "ok";
        //    }
        //    catch (Exception e) { success = Helpers.ErrorDetails(e); }
        //    return success;
        //}


        //[HttpPost]
        //public JsonResult CreateImagePageStaticFile(StaticPageModel staticPage)
        //{
        //    string success = "";
        //    try
        //    {
        //        var articleTagString = "naked women";
        //        //$('head').append('<meta property="og:description" content="' + beautify(summary.substr(0, 300)) + '" />');
        //        //$('head').append("<meta property='og:image' content='https://api.curtisrhodes.com/app_data/images/" + articleImageName + "'/>");

        //        var head = "<head><script src='https://code.jquery.com/jquery-latest.min.js' type='text/javascript'></script>" +
        //            "<script src='https://code.jquery.com/ui/1.12.1/jquery-ui.min.js' type='text/javascript'></script>" +
        //            "<script src = '../Scripts/GlobalFunctions.js'></script>" +
        //            "<script src = '../Scripts/ResizeThreeColumnPage.js'></script>" +
        //            "<script src = '../Scripts/staticPage.js'></script>" +
        //            "<link href = '../Styles/Default.css' rel= 'stylesheet' />" +
        //            "<link href = '../Styles/fixedHeader.css' rel= 'stylesheet' />" +
        //            "<link href = '../Styles/imageViewer.css' rel='stylesheet' />" +
        //            "<link href = '../Styles/footer.css' rel= 'stylesheet' />" +
        //            "<link href = '../Styles/ImagePage.css' rel= 'stylesheet' />" +
        //            "<meta name = 'Title' content = " + staticPage.Filename + " property= 'og:title' />" +
        //            "<meta property = 'og:type' content = 'website' />" +
        //            "<meta property = 'og:url' content = 'https://OggleBooble.com/static_pages/" + staticPage.Filename + "' />" +
        //            "<meta name = 'Keywords' content = '" + articleTagString + "' />" +
        //            "</head>";

        //        string staticContent =
        //            "<!DOCTYPE html><html>" + head + "<body style='margin-top:105px'>" + staticPage.Html
        //             + "<script> $('.thumbImage').click(function() { LaunchViewer(imageArray,$(this).attr('idx'),'" + staticPage.FolderId + "','cc'); });"
        //             + " var imageArray=" + staticPage.ImageArray
        //             + "</script><script src='../Scripts/ImageViewer.js'></script></body></html>";

        //        //string filePath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Static_Pages");
        //        //string filePath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Static_Pages");
        //        //string filePath = Server.MapPath("~/Static_Pages");
        //        //string filePath = "ftp://50.62.160.105/library.curtisrhodes.com/" + staticPage.Filename;
        //        //string filePath = "http://library.curtisrhodes.com/" + staticPage.Filename;

        //        string filePath = Server.MapPath("~/Static_Pages");
        //        using (var staticFile = System.IO.File.Open(filePath + "/" + staticPage.Filename, FileMode.Create))
        //        {
        //            Byte[] byteArray = Encoding.ASCII.GetBytes(staticContent);
        //            staticFile.Write(byteArray, 0, byteArray.Length);
        //        }

        //        success = "ok";
        //    }
        //    catch (Exception e) { success = Helpers.ErrorDetails(e); }
        //    return Json(success, JsonRequestBehavior.AllowGet);
        //}

        //public string GetStaticPage(string fileName )
        //{
        //    string rtn = "";
        //    string fullPath = Server.MapPath("~/Static_Pages") + "\\" + fileName;
        //    if ( System.IO.File.Exists(fullPath))
        //    {
        //        rtn = fullPath;
        //    }
        //    return rtn;
        //}
    }

    public class StaticPageModel
    {
        public string Html { get; set; }
        public string Filename { get; set; }
        public string FolderId { get; set; }
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