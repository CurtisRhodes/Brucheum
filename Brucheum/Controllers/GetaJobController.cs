﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Brucheum.Controllers
{
    public class GetaJobController : Controller
    {
        private string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];

        public ActionResult Index()
        {
            return View();
        }
        public ActionResult ResumeAdmin()
        {
            ViewBag.Service = apiService;
            return View();
        }
    }
}