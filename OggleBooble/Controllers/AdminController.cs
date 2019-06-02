using Microsoft.AspNet.SignalR.Client;
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
        private readonly HubConnection hubConnection = null;
        private readonly string apiService = ConfigurationManager.AppSettings["apiService"];

        public ActionResult MetaTagEdit()
        {
            return View();
        }
        public ActionResult Index()
        {
            return View("Admin");
        }
        public ActionResult Dashboard()
        {
            ViewBag.IsPornEditor = User.IsInRole("Porn Editor");
            ViewBag.Service = apiService;
            return View();
        }

        private void Execute()
        {
            hubConnection.Start().ContinueWith(task =>
            {
                if (task.IsFaulted)
                {
                    Console.WriteLine("error opening connection {0}", task.Exception.GetBaseException());
                    return;
                }
                else
                    Console.WriteLine("Connected" + hubConnection.ConnectionId);
            }).Wait();
        }

        public ActionResult Blog()
        {
            ViewBag.Service = apiService;
            return View();
        }
        [HttpPost]
        public JsonResult BuildPartialView(StaticPageModel staticPage)
        {
            string success = "";
            try
            {
                string filePath = System.Web.HttpContext.Current.Server.MapPath("~/Views/Shared/" + staticPage.Filename);

                using (var staticFile = System.IO.File.Open(filePath, System.IO.FileMode.Create))
                {
                    Byte[] byteArray = System.Text.Encoding.ASCII.GetBytes(staticPage.Html);
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