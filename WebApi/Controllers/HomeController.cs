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
        public ActionResult Index()
        {
            var vm = new ResponseModel();
            return View(vm);
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
            var emailMessage = new EmailMessageModel() { Subject = "Test Email", Body = "may you have a good day" };

            string success = new GodaddyEmailController().Post(emailMessage);

            //string success = new EmailController().SendWithHotMail(emailMessage);

            ResponseModel vm = new ResponseModel() { Response = success };
            return View("Index", vm);

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

namespace WebApi.Models
{    public class ResponseModel
    {
        public string Response { get; set; }
    }
    public class EmailMessageModel
    {
        public string Subject { get; set; }
        public string Body { get; set; }
    }
    public class HitCounterModel
    {
        public string IpAddress { get; set; }
        public string AppName { get; set; }
        public string PageName { get; set; }
        public string Details { get; set; }
    }
}