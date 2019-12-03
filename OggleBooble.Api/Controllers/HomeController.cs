using OggleBooble.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using OggleBooble.Api.MsSQLDataContext;

namespace OggleBooble.Api.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Title = "Home Page";

            return View();
        }
        [HttpGet]
        public string GetBuildInfo()
        {
            string lastBuild = "11:11";
            string path = System.Web.HttpContext.Current.Server.MapPath("~/bin/OggleBooble.Api.dll");
            if (System.IO.File.Exists(path))
            {
                lastBuild = System.IO.File.GetLastWriteTime(path).ToShortDateString();
            }
            return lastBuild;
        }
        [HttpGet]
        public JsonResult MsSqlTest(int parent)
        {
            var testResults = new TestResults();
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                List<CategoryFolder> categoryFolders = db.CategoryFolders.Where(f => f.Parent == parent).ToList();
                foreach (CategoryFolder categoryFolder in categoryFolders)
                {
                    testResults.Items.Add(new TestResultsItem() { Id = categoryFolder.Id, FolderName = categoryFolder.FolderName });
                }
                testResults.Success = "ok";
            }
            return Json(testResults, JsonRequestBehavior.AllowGet);
        }
    }
}
