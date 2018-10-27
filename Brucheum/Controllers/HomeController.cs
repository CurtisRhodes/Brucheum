using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Brucheum
{
    public class HomeController : Controller
    {
        private string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];
        public ActionResult Index()
        {
            return RedirectToRoutePermanent("Start");
        }

        public ActionResult DirTreeTest(string articleId)
        {
            ViewBag.Service = apiService;
            return View();
        }
        public ActionResult Journal()
        {
            ViewBag.Service = apiService;
            return View();
        }
        public ActionResult TheBrucheum()
        {
            return View();
        }
        public ActionResult get_image(string w)
        {            
            ViewBag.Service = apiService;
            ViewBag.imageId = w;
            //return PartialView("get_image");
            return View();
        }
        public ActionResult Apps()
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
            string errorMessage = ex.Message;
            if (ex.InnerException != null)
            {
                errorMessage += "<br/>" + ex.InnerException.Message;
                if (ex.InnerException.InnerException != null)
                    errorMessage += "<br/>" + ex.InnerException.InnerException.Message; ;
            }
            //var text = ex.StackTrace.Replace("\r\n", "<br/>");

            ViewBag.StackTrace = ex.StackTrace.Replace("\r\n","");
            ViewBag.ErrorMessage = errorMessage;
            return View();
        }
    }

}