using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Web.Mvc;

namespace OggleBooble
{
    public class HomeController : Controller
    {
        private string apiService = ConfigurationManager.AppSettings["apiService"];
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult ImagePage(string folder)
        {
            if (folder == null)
                return View("Index");
            ViewBag.Title = folder.Substring(folder.LastIndexOf("/") + 1);
            ViewBag.Service = apiService;
            ViewBag.Folder = folder;
            return View();
        }
        public ActionResult Gallery(string folder)
        {
            if (folder == null)
                return View("Index");
            ViewBag.Title = folder.Substring(folder.LastIndexOf("/") + 1);
            ViewBag.Service = apiService;
            ViewBag.Folder = folder;
            return View();
        }
        public ActionResult Viewer(string folder, string startFile)
        {
            if (folder == null)
                return View("Index");
            ViewBag.Title = "Slideshow"; // folder.Substring(folder.LastIndexOf("/") + 1);
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
}