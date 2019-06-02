using Microsoft.AspNet.SignalR;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Web.Mvc;

namespace OggleBooble.Controllers
{
    public class PornController : Controller
    {
        private readonly string apiService = ConfigurationManager.AppSettings["apiService"];
        public ActionResult Index()
        {
            ViewBag.Service = apiService;
            return View();
        }
    }
}
