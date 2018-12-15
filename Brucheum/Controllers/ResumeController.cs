using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Brucheum.Controllers
{
    public class ResumeController : Controller
    {
        private string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];

        // GET: Resume
        public ActionResult ResumeAdmin()
        {
            ViewBag.UserId = User.Identity.GetUserId();
            ViewBag.Service = apiService;
            return View();
        }
    }
}