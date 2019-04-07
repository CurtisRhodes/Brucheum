using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace OggleBooble.Controllers
{
    public class AdminController : Controller
    {
        private string apiService = ConfigurationManager.AppSettings["apiService"];

        public ActionResult Index()
        {
            return View("Admin");
        }
        public ActionResult Dashboard()
        {
            ViewBag.Service = apiService;
            return View();
        }
        public ActionResult Blog()
        {
            ViewBag.Service = apiService;
            return View();
        }
        [HttpPost]
        public JsonResult BuildPartialView(staticPageModel staticPage)
        {
            string success = "";
            try
            {
                string filePath = System.Web.HttpContext.Current.Server.MapPath("~/Views/Shared/" + staticPage.filename);
                
                using (var staticFile = System.IO.File.Open(filePath, System.IO.FileMode.Create))
                {
                    Byte[] byteArray = System.Text.Encoding.ASCII.GetBytes(staticPage.html);
                    staticFile.Write(byteArray, 0, byteArray.Length);
                }
                success = "ok";
            }
            catch (Exception e)
            {
                //if(e.)

                success = Helpers.ErrorDetails(e);
            }
            return Json(success, JsonRequestBehavior.AllowGet);
        }
    }
}