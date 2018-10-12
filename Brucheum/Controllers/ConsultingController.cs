using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Brucheum
{
    public class ConsultingController : Controller
    {
        private string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];

        public ActionResult Index()
        {
            return RedirectToAction("ConsultingHome");
        }

        public ActionResult ConsultingHome()
        {
            return View();
        }
        public ActionResult AdminRefTable() 
        {
            ViewBag.Service = apiService;
            return View();
        }
    }
}