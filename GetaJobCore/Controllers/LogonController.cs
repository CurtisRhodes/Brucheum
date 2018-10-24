using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Mvc;

namespace GetaJobCore.Controllers
{
    public class LogonController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
        private string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];

        public ActionResult LoginPopup()
        {
            ViewBag.Service = apiService;
            return PartialView("_LoginPopup");
        }

        public ActionResult RegisterPopup()
        {
            //ViewBag.UserId = Session["UserId"];
            ViewBag.Service = apiService;
            return PartialView("_RegisterPopup");
        }

        public ActionResult ProfilePopup()
        {
            //ViewBag.UserId = Session["UserId"];
            ViewBag.Service = apiService;
            //return PartialView("_RegisterPopup");
            return PartialView("_ProfilePopup");
        }

        [HttpGet]
        public string SetCookie(string userName, string userId, string useCookie)
        {
            string success = "oh no";
            try
            {
                //Session["UserName"] = userName;
                //Session["UserId"] = userId;

                //HttpCookie brucheumCookie = Request.Cookies["Brucheum"];
                //if (brucheumCookie == null)
                //{
                //    brucheumCookie = new HttpCookie("Brucheum");
                //}
                //brucheumCookie.Name = "Brucheum";
                //brucheumCookie.Values["UserName"] = userName;
                //brucheumCookie.Values["UserId"] = userId;
                //brucheumCookie.Values["UseCookie"] = useCookie;
                //brucheumCookie.Expires = DateTime.Now.AddMonths(1);

                //Response.Cookies.Add(brucheumCookie);
                success = "ok";
            }
            catch (Exception ex)
            {
                success = ex.Message;
            }
            return success;
        }

        [HttpGet]
        public string DeleteCookie()
        {
            var success = "on no";
            //Session["UserName"] = null;
            //Session["UserId"] = null;
            //HttpCookie brucheumCookie = Request.Cookies["Brucheum"];
            //if (brucheumCookie == null)
            //{
            //    success = "no cookie found";
            //}
            //else
            //{
            //    brucheumCookie["UserName"] = "";
            //    brucheumCookie["UserId"] = "";
            //    brucheumCookie["UseCookie"] = "false";
            //    brucheumCookie.Expires = DateTime.Now.AddDays(-1);
            //    Response.Cookies.Add(brucheumCookie);
            //    success = "ok";
            //}
            return success;
        }
    }



}