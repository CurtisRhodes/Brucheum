using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace OggleBooble.Controllers
{
    public class StatsController : Controller
    {
        private readonly string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];

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


        [HttpPost]
        public JsonResult ConnectionTest()
        {
            string success = "ok";
            return Json(success, JsonRequestBehavior.AllowGet);
        }
    }

    public class StaticPageModel
    {
        public string Html { get; set; }
        public string Filename { get; set; }
    }
}
