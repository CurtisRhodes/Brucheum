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
            ViewBag.Service = apiService;
            return View();
            //return RedirectToRoute("Start");
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
}