using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Brucheum
{
    public class BookController : Controller
    {
        private string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];

        public ActionResult MyBooks()
        {
            return View();
        }
        public ActionResult TheBlondJew()
        {
            ViewBag.Service = apiService;
            return View();
        }
        public ActionResult TableOfContents(string bookTitle)
        {
            ViewBag.Title = bookTitle;
            ViewBag.Service = apiService;
            return View();
        }
        public ActionResult Read(string bookTitle, string startingPoint)
        {
            ViewBag.Title = bookTitle;
            ViewBag.Service = apiService;
            return View();
        }
        public ActionResult MyLibrary()
        {
            return View();
        }
        public ActionResult BooksRead()
        {
            return View();
        }
        public ActionResult EditTreePopup(string bookTitle)
        {
            ViewBag.Title = bookTitle;
            ViewBag.Service = apiService;
            return PartialView("_EditTreePopup");
        }
        public ActionResult Write(string bookTitle, string chapterId, string sectionId, string subSectionId)
        {
            ViewBag.BookTitle = bookTitle;
            ViewBag.Service = apiService;
            ViewBag.chapterId = chapterId;
            ViewBag.sectionId = sectionId;
            ViewBag.subSectionId = subSectionId;
            return View();
        }
    }
}