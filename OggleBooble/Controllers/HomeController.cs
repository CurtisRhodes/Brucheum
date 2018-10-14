using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Mvc;

namespace OggleBooble
{
    public class HomeController : Controller
    {
        private string apiService = ConfigurationManager.AppSettings["apiService"];
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult ImagePage(string folder)
        {
            ViewBag.Title = folder.Substring(folder.LastIndexOf("/") + 1);
            ViewBag.Service = apiService;
            ViewBag.Folder = folder;
            return View();
        }
        public ActionResult Gallery(string folder)
        {
            ViewBag.Title = folder.Substring(folder.LastIndexOf("/") + 1);
            ViewBag.Service = apiService;
            ViewBag.Folder = folder;
            return View();
        }
        public ActionResult Viewer(string folder, string startFile)
        {
            ViewBag.Title = folder.Substring(folder.LastIndexOf("/") + 1);
            ViewBag.Service = apiService;
            ViewBag.Folder = folder;
            ViewBag.StartFile = startFile;
            return View();
        }
        public ActionResult Transitions(string folder)
        {
            ViewBag.Title = folder.Substring(folder.LastIndexOf("/") + 1);
            ViewBag.Service = apiService;
            ViewBag.Folder = folder;
            return View();
        }

    }
}