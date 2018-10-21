using System.Configuration;
using System.Web.Mvc;

namespace OggleBooble
{
    public class HomeController : Controller
    {
        private string apiService = ConfigurationManager.AppSettings["apiService"];
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult ImagePage(string folder)
        {
            if (folder == null)
                return View("Index");
            ViewBag.Title = folder.Substring(folder.LastIndexOf("/") + 1);
            ViewBag.Service = apiService;
            ViewBag.Folder = folder;
            return View();
        }
        public ActionResult Gallery(string folder)
        {
            if (folder == null)
                return View("Index");
            ViewBag.Title = folder.Substring(folder.LastIndexOf("/") + 1);
            ViewBag.Service = apiService;
            ViewBag.Folder = folder;
            return View();
        }
        public ActionResult Viewer(string folder, string startFile)
        {
            if (folder == null)
                return View("Index");
            ViewBag.Service = apiService;
            ViewBag.Folder = folder;
            ViewBag.StartFile = startFile;
            return View();
        }

        public ActionResult Transitions()
        {
            ViewBag.Service = apiService;
            return View();
        }
        public ActionResult BoobsRanker()
        {
            ViewBag.Service = apiService;
            return View();
        }

    }
}