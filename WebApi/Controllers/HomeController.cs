using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebApi.Models;

namespace WebApi
{
    public class HomeController : Controller
    {
        ResponseModel pageResponse = new ResponseModel();

        public ActionResult Index()
        {
            pageResponse.LastBuild = "last build: " + GetBuildInfo();
            return View(pageResponse);
        }

        public ActionResult ImageTest()
        {
            return View();
        }

        public ActionResult JournalTest()
        {
            var vm = new ResponseModel();
            return View(vm);
        }

        [HttpPost]
        public ActionResult EmailTest()
        {
            pageResponse.LastBuild = "last build: " + GetBuildInfo();
            //var emailMessage = new EmailMessageModel() { Subject = "Test Email", Body = "may you have a good day" };
            pageResponse.EmailSuccess = new GodaddyEmailController().SendEmail("Test Email", "may you have a good day");
            return View("Index", pageResponse);
        }

        public ActionResult ArticleTest(string Id)
        {
            //ViewBag.Id = Id;
            //ViewBag.Categories = GetArticleCategories();
            return View();
        }

        private string GetBuildInfo()
        {
            string lastBuild = "11:11";
            string path = System.Web.HttpContext.Current.Server.MapPath("~/bin/WebApi.dll");
            if (System.IO.File.Exists(path))
            {
                lastBuild = System.IO.File.GetLastWriteTime(path).ToShortDateString();
            }
            return lastBuild;
        }
    }

    public class ErrorController : Controller
    {
        public ActionResult Index(string msg, string st)
        {
            //Exception x = HttpContext.Server.GetLastError();
            //Exception ex = (Exception)Session["LastError"];
            //string errorMessage = ex.Message;
            //if (ex.InnerException != null)
            //{
            //    errorMessage += "<br/>" + ex.InnerException.Message;
            //    if (ex.InnerException.InnerException != null)
            //        errorMessage += "<br/>" + ex.InnerException.InnerException.Message; ;
            //}
            //var text = ex.StackTrace.Replace("\r\n", "<br/>");
            ViewBag.StackTrace = st.Replace("\r\n", "");
            ViewBag.ErrorMessage = msg;
            return View();
        }
        public ActionResult NotFound()
        {
            return View();
        }
    }

    public class ResponseModel
    {
        public string EmailSuccess { get; set; }
        public string LastBuild { get; set; }
        public string Success { get; set; }
        public string Response { get; set; }
    }
}
