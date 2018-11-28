
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;

namespace Brucheum
{
    public class ArticleController : Controller
    {
        private string apiService = ConfigurationManager.AppSettings["apiService"];

        public ActionResult ArticleList(string filterType, string filter)
        {
            ViewBag.FilterType = filterType;
            ViewBag.Filter = filter;
            ViewBag.Service = apiService;
            return View();
        }

        public ActionResult Article(string Id)
        {
            ArticleModel article = new ArticleModel();
            if (Id != null)
            {
                article.Id = Id;
                var client = new HttpClient();
                client.BaseAddress = new Uri(apiService);
                using (var response = client.GetAsync("api/Article?Id=" + Id).Result)
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var json = response.Content.ReadAsStringAsync().Result;
                        var jo = JObject.Parse(json);
                        article = jo.ToObject<ArticleModel>();

                        if (article.Tags != null)
                        {
                            int len = article.Tags.Length;
                            if (len > 0)
                            {
                                StringBuilder tagString = new StringBuilder();
                                for (int i = 0; i < len; i++)
                                {
                                    tagString.Append(article.Tags[i]);
                                    if (i != (len - 1))
                                        tagString.Append(",");
                                }
                                ViewBag.MetaTags = tagString;
                            }
                        }
                        ViewBag.Title = article.Title;
                        ViewBag.Contents = article.Contents.Replace("\n", " ");
                        ViewBag.Summary = article.Summary.Replace("\n", " ");
                    }
                }
            }
            ViewBag.IpAddress = Helpers.GetIPAddress();
            ViewBag.Service = apiService;
            ViewBag.UserId = User.Identity.GetUserId();  //   Session["UserId"];
            ViewBag.UserName = User.Identity.GetUserName();  //    Session["UserName"];
            //ViewBag.FilePath = System.Web.HttpContext.Current.Server.MapPath("~/Static_Pages");

            return View(article);
        }

        public ActionResult ArticleView(string Id)
        {
            ViewBag.IpAddress = Helpers.GetIPAddress();
            ViewBag.Service = apiService;
            ViewBag.UserId = User.Identity.GetUserId();  //   Session["UserId"];
            ViewBag.UserName = User.Identity.GetUserName();  //    Session["UserName"];
            return View();
        }

        public ActionResult HtmlPage(string page)
        {
            string filePath = System.Web.HttpContext.Current.Server.MapPath("~/Static_Pages");
            string htmlFileName = Path.Combine(filePath, page );
            return File(htmlFileName, "text/html");

        }

        public ActionResult ArticleEdit(string Id)
        {
            ViewBag.Service = apiService;
            ViewBag.ArticleId = Id;
            //ViewBag.Categories = GetArticleCategories();
            return View();
        }

        //public class HtmlModel {
        //    public string html { get; set; }
        //}

        [HttpPost]
        public JsonResult CreateStaticFile(string html)
        {
            string success = "";
            try
            {
                string filePath = Server.MapPath("~/Static_Pages");
                //string html = Request.     .RequestContext.HttpContext.CurrentHandler.   .Content.ReadAsStringAsync().Result;
                string fileName = html.Substring(html.IndexOf("divTitle") + 10, 500);
                fileName = filePath + "/" + fileName.Substring(0, fileName.IndexOf("</div>")).Replace(" ", "_") + ".html";

                using (var staticFile = System.IO.File.Open(fileName, FileMode.OpenOrCreate))
                {
                    Byte[] byteArray = Encoding.ASCII.GetBytes(html);
                    staticFile.Write(byteArray, 0, byteArray.Length);
                }
                //File.WriteAllBytes(fileName, byteArray);                
                success = "ok";
            }
            catch (Exception e) { success = Helpers.ErrorDetails(e); }
            return Json(success, JsonRequestBehavior.AllowGet);
        }
    }
}