using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace OggleBooble.Controllers
{
    public class AdminController : Controller
    {
        private string apiService = ConfigurationManager.AppSettings["apiService"];

        public ActionResult Index()
        {
            return View("Admin");
        }
        public ActionResult Dashboard()
        {
            ViewBag.Service = apiService;
            return View();
        }
        public ActionResult Blog()
        {
            ViewBag.Service = apiService;
            return View();
        }
    }
}