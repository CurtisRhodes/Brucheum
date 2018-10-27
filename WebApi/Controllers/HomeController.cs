using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WebApi
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult ImageTest()
        {
            return View();
        }
        public ActionResult JournalTest()
        {
            return View();
        }

        public ActionResult EmailTest()
        {
            return View();
        }

        public ActionResult ArticleTest(string Id)
        {
            //ViewBag.Id = Id;
            //ViewBag.Categories = GetArticleCategories();
            return View();
        }
    }
}
