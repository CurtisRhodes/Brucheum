using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WebApi
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult ImageTest()
        {
            return View();
        }
        public ActionResult JournalTest()
        {
            return View();
        }

        public ActionResult EmailTest()
        {
            return View();
        }

        public ActionResult ArticleTest(string Id)
        {
            //ViewBag.Id = Id;
            //ViewBag.Categories = GetArticleCategories();
            return View();
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

}
