﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Brucheum
{
    public class HomeController : Controller
    {
        private string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];
        public ActionResult Index()
        {
            return View();
            //return RedirectToRoutePermanent("Start");
        }

        public ActionResult DirTreeTest(string articleId)
        {
            ViewBag.Service = apiService;
            return View();
        }
        public ActionResult Journal()
        {
            ViewBag.Service = apiService;
            return View();
        }
        public ActionResult TheBrucheum()
        {
            return View();
        }
        public ActionResult get_image(string w)
        {
            ViewBag.Service = apiService;
            ViewBag.imageId = w;
            //return PartialView("get_image");
            return View();
        }
        public ActionResult Apps()
        {
            ViewBag.Service = apiService;
            return View();
        }
    }

    public class ErrorController : Controller
    {
        public ViewResult AppError(string msg, string st)
        {
            ViewBag.StackTrace = st;
            ViewBag.ErrorMessage = msg;
            return View();
        }

        public ViewResult Index()
        {
            string stackTrace = "";
            string errorMessage = "unknown Error";
            //if (HttpContext.Session != null)
            {
                //Exception ex = (Exception)Session["LastError"];
                var ex = Server.GetLastError();
                if (ex.InnerException != null)
                {
                    errorMessage += "<br/>" + ex.InnerException.Message;
                    if (ex.InnerException.InnerException != null)
                        errorMessage += "<br/>" + ex.InnerException.InnerException.Message; ;
                }
                stackTrace = ex.StackTrace.Replace("\r\n", "<br/>");
            }
            ViewBag.StackTrace = stackTrace;
            ViewBag.ErrorMessage = errorMessage;
            return View();
        }
    }
}