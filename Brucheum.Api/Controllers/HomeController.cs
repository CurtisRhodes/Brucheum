using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Brucheum.Api
{
    [EnableCors("*", "*", "*")]
    public class HomeController : ApiController
    {
        //ResponseModel pageResponse = new ResponseModel();

        [HttpGet]
        //[Route("api/Home/GetBuildInfo")]
        public string GetBuildInfo()
        {
            string lastBuild = "11:11";
            string path = HttpContext.Current.Server.MapPath("~/bin/Brucheum.Api.dll");
            if (System.IO.File.Exists(path))
            {
                lastBuild = System.IO.File.GetLastWriteTime(path).ToShortDateString();
            }
            return lastBuild;
        }

        [HttpGet]
        //[Route("api/Home/EmailTest")]
        public string EmailTest()
        {
            string success;
            using (var db = new WebSiteContext())
            {
                //success= godaddyEmailController.SendEmail("this is a test", "message 8");
                success = "ok";
            }
            return success;
        }




        //[HttpGet]
        //public JsonResult MsSqlTest(int parent)
        //{
        //    var testResults = new TestResults();
        //    using (OggleBoobleContext db = new OggleBoobleContext())
        //    {
        //       List<CategoryFolder> categoryFolders = db.CategoryFolders.Where(f => f.Parent == parent).ToList();
        //        foreach (CategoryFolder categoryFolder in categoryFolders) {
        //            testResults.Items.Add(new TestResultsItem() { Id = categoryFolder.Id, FolderName = categoryFolder.FolderName });
        //        }
        //        testResults.Success = "ok";
        //    }
        //    return Json(testResults, JsonRequestBehavior.AllowGet);
        //}

        //[HttpPost]
        //public ActionResult EmailTest()
        //{
        //    pageResponse.LastBuild = "last build: " + GetBuildInfo();
        //    //var emailMessage = new EmailMessageModel() { Subject = "Test Email", Body = "may you have a good day" };
        //    pageResponse.EmailSuccess = new GodaddyEmailController().SendEmail("Test Email", "may you have a good day");
        //    return View("Index", pageResponse);
        //}
    }
    public class TestResults
    {
        public TestResults() {
            Items = new List<TestResultsItem>();
        }
        public string Success { get; set; }
        public List<TestResultsItem> Items { get; set; }
    }
    public class TestResultsItem
    {
        public int Id { get; set; }
        public string FolderName { get; set; }
    }
}


