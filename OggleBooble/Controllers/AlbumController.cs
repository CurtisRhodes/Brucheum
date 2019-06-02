using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace OggleBooble.Controllers
{
    public class AlbumController : Controller
    {
        private readonly string apiService = ConfigurationManager.AppSettings["apiService"];

        public ActionResult Index(string folder)
        {
            if (folder == null)
                return RedirectToAction("Home");

            ViewBag.Title = folder.Substring(folder.LastIndexOf("/") + 1);
            ViewBag.IsPornEditor = User.IsInRole("Porn Editor");
            ViewBag.Service = apiService;
            ViewBag.IpAddress = Helpers.GetIPAddress();
            ViewBag.Folder = folder;
            return View("Album");
        }
    }
}