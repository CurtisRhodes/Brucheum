using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace OggleBooble.Controllers
{
    public class StatsController : Controller
    {
        private string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];

        public ActionResult Index()
        {
            ViewBag.Service = apiService;
            return View("Dashboard");
        }
        public ActionResult Dashboard()
        {
            ViewBag.Service = apiService;
            return View();
        }
    }
}