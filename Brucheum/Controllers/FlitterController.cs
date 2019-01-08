using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Brucheum.Controllers
{
    public class FlitterController : Controller
    {
        private string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];

        public ActionResult Flitter()
        {
            ViewBag.UserId = User.Identity.GetUserId();
            return View();
        }
        public ActionResult ToDo()
        {
            ViewBag.Service = apiService;
            return View();
        }
    }
}