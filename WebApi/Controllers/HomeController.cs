using Service1.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Service1.Controllers
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

        public ActionResult ArticleTest(string Id)
        {
            ViewBag.Id = Id;
            ViewBag.Categories = GetArticleCategories();
            return View();
        }

        private Dictionary<string, string> GetArticleCategories()
        {
            var articleCategories = new Dictionary<string, string>();
            articleCategories.Add("UnCategorized", "-- select --");
            articleCategories.Add("Rant", "Political Rant");
            articleCategories.Add("Flitter", "Flitter of Joy");
            articleCategories.Add("Agnst", "Moment of Desparation");
            articleCategories.Add("Cosmic", "Philosophical Observation");
            articleCategories.Add("Conspiracy", "Conspiracy Theory");
            articleCategories.Add("Funny", "Comical Take");
            articleCategories.Add("Techie", "Technical Article");
            articleCategories.Add("Science", "Scientific Theses");
            return articleCategories;
        }
    }
}
