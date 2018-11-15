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
        public ActionResult MyResume()
        {
            ViewBag.Service = apiService;
            return View();
        }
        public ActionResult About()
        {
            return View();
        }
        public ActionResult Approach()
        {
            return View();
        }
        public ActionResult Portfolio()
        {
            return View();
        }
        public ActionResult Code()
        {
            return View();
        }
        public ActionResult Articles()
        {
            ViewBag.Service = apiService;
            return View();
        }
        public ActionResult Contact()
        {
            return View();
        }
    }
}