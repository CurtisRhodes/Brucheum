using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Brucheum.Controllers
{
    public class BookDbController : Controller
    {
        private string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult ToC(int book)
        {
            ViewBag.Service = apiService;
            ViewBag.BookId = book;
            return View();
        }

        public ActionResult Read(int b, int c, int t, int id)
        {
            ViewBag.Service = apiService;
            ViewBag.BookId = b;
            ViewBag.ChapterId = c;
            ViewBag.SectionType = t;
            ViewBag.SectionId = id;
            return View();
        }

        public ActionResult Edit(int book)
        {
            ViewBag.Service = apiService;
            ViewBag.BookId = book;
            return View();
        }

        public ActionResult Write(int? chapter)
        {
            if (chapter == null)
                {

            }
            ViewBag.Service = apiService;
            //ViewBag.BookId = book;
            
            ViewBag.ChapterId = chapter;
            return View();
        }
    }
}