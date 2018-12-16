using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Brucheum
{
    public class IntelDsgnController : Controller
    {
        private string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];

        public ActionResult Index(string a)
        {
            ViewBag.Service = apiService;
            ViewBag.ArticleId = a;
            return View();
        }
        public ActionResult MyResume()
        {
            ViewBag.Service = apiService;
            ViewBag.UserId = User.Identity.GetUserId();
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
        public ActionResult Blog()
        {
            ViewBag.UserId = User.Identity.GetUserId();
            ViewBag.Service = apiService;
            return View();
        }
        public ActionResult Contact()
        {
            return View();
        }
    }
}