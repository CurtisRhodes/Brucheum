using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Brucheum.Controllers
{
    public class ErrorController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult ErrorwMessages(string msg, string st)
        {
            if (msg == null)
                return View("Index");
            if (st != null)
                ViewBag.StackTrace = st.Replace("\r\n", "<br/>");
            if (msg != null)
                ViewBag.ErrorMessage = msg;
            return View();
        }

        public ActionResult NotFound(string aspxerrorpath)
        {
            ViewBag.ErrorPath = aspxerrorpath;
            return View();
        }

        public ActionResult ErrorwException(Exception lastError)
        {
            string stackTrace = "";
            string errorMessage = "unknown Error";
            var ex = Server.GetLastError();
            if (ex.InnerException != null)
            {
                errorMessage += "<br/>" + ex.InnerException.Message;
                if (ex.InnerException.InnerException != null)
                    errorMessage += "<br/>" + ex.InnerException.InnerException.Message; ;

                stackTrace = ex.StackTrace.Replace("\r\n", "<br/>");
            }
            ViewBag.StackTrace = stackTrace;
            ViewBag.ErrorMessage = errorMessage;
            return View();
        }

    }
}