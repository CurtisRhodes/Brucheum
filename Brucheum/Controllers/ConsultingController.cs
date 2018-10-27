using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Brucheum
{


    //<li class="menuTab"><a asp-page="~/ConsultingAbout/">Who We Are</a></li>
    //<li class="menuTab"><a asp-page="~/Consulting/Approach">Our Approach</a></li>
    //<li class="menuTab"><a asp-pag="~/Consulting/Portfolio">Portfolio</a></li>
    //<li class="menuTab"><a asp-page="~/Consulting/Code">Sample Code</a></li>
    //<li class="menuTab"><a asp-pag="~/Consulting/Artilces">Artilces</a></li>
    //<li class="menuTab"><a asp-pag="~/Consulting/Contact">Contact Us</a></li>
    //<li class="menuTab"><a asp-pag="~/Consulting/MyResume">My Resume</a></li>
    //<li class="menuTab"><a asp-pag="~/Consulting/AdminRefTable">Admin</a></li>

    public class ConsultingController : Controller
    {
        private string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];

        public ActionResult Index()
        {
            return RedirectToAction("ConsultingHome");
        }
        public ActionResult ConsultingHome()
        {
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
        public ActionResult Articles()
        {
            return View();
        }
        public ActionResult Contact()
        {
            return View();
        }
        public ActionResult MyResume()
        {
            return View();
        }
        public ActionResult Admin() 
        {
            ViewBag.Service = apiService;
            return View();
        }
    }
}