using System;
using System.Web;
using System.Web.Mvc;

namespace OggleBooble.Controllers
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
        public string SetoggleBoobleCookie(string userName, string userId, string useCookie)
        {
            string success = "oh no";
            try
            {
                Session["UserName"] = userName;
                Session["UserId"] = userId;

                HttpCookie oggleBoobleCookie = Request.Cookies["OggleBooble"];
                if (oggleBoobleCookie == null)
                {
                    oggleBoobleCookie = new HttpCookie("OggleBooble");
                }
                oggleBoobleCookie.Name = "OggleBooble";
                oggleBoobleCookie.Values["UserName"] = userName;
                oggleBoobleCookie.Values["UserId"] = userId;
                oggleBoobleCookie.Values["UseCookie"] = useCookie;
                oggleBoobleCookie.Expires = DateTime.Now.AddMonths(1);

                Response.Cookies.Add(oggleBoobleCookie);

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
            Session["UserName"] = null;
            Session["UserId"] = null;
            HttpCookie oggleBoobleCookie = Request.Cookies["OggleBooble"];
            if (oggleBoobleCookie == null)
            {
                success = "no cookie found";
            }
            else
            {
                oggleBoobleCookie["UserName"] = "";
                oggleBoobleCookie["UserId"] = "";
                oggleBoobleCookie["UseCookie"] = "false";
                oggleBoobleCookie.Expires = DateTime.Now.AddDays(-1);
                Response.Cookies.Add(oggleBoobleCookie);
                success = "ok";
            }
            return success;
        }
    }
}
