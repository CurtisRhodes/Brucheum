using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Brucheum
{
    public class LoginController : Controller
    {
        private string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];

        public ActionResult LoginPopup()
        {
            ViewBag.Service = apiService;
            return PartialView("_LoginPopup");
        }

        public ActionResult RegisterPopup()
        {
            ViewBag.Service = apiService;
            return PartialView("_RegisterPopup");
        }
        
        public ActionResult ProfilePopup()
        {
            ViewBag.UserId = Session["UserId"];
            ViewBag.Service = apiService;
            //return PartialView("_RegisterPopup");
            return PartialView("_ProfilePopup");
        }

        [HttpGet]
        public string SetBrucheumCookie(string userName, string userId, string useCookie)
        {
            string success = "oh no";
            try
            {
                Session["UserName"] = userName;
                Session["UserId"] = userId;

                HttpCookie brucheumCookie = Request.Cookies[0];
                if (brucheumCookie == null)
                {
                    brucheumCookie = new HttpCookie("Brucheum");
                }
                brucheumCookie.Name = "Brucheum";
                brucheumCookie.Values["UserName"] = userName; //System.Web.HttpContext.Current.User.Identity.Name;
                brucheumCookie.Values["UserId"] = userId;
                //if (useCookie != "unknown")
                    brucheumCookie.Values["UseCookie"] = useCookie;

                brucheumCookie.Expires = DateTime.Now.AddMonths(1);

                Response.Cookies.Add(brucheumCookie);
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
            Session["UserName"] = "";
            Session["UserId"] = "";
            HttpCookie brucheumCookie = Request.Cookies[0];
            if (brucheumCookie == null)
            {
                 success = "no cookie found";
            }
            else
            {
                brucheumCookie["UserName"] = "";
                brucheumCookie["UserId"] = "";
                brucheumCookie["UseCookie"] = "false";
                brucheumCookie.Expires = DateTime.Now.AddDays(-1);
                Response.Cookies.Add(brucheumCookie);
                success = "ok";
            }
            return success;
        }
    }
    public class FaceBookUser
    {
        public string FaceBookId { get; set; }
        public string Name { get; set; }
    }

}

