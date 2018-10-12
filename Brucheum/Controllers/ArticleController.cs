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

        public ActionResult Article(string Id, string title)
        {
            //string filePath = System.Web.HttpContext.Current.Server.MapPath("~/Static_Pages");
            ////string filePath = "Static_Pages";
            //string htmlFileName = Path.Combine(filePath, title + ".html");
            //if (System.IO.File.Exists(htmlFileName))
            //{
            //    //return RedirectToRoute("Start");
            //    //return RedirectToAction("HtmlPage", new { page = title + ".html" });    //   File(htmlFileName, "text/html");
            //    return Redirect(htmlFileName);
            //}
            //else
            {
                ArticleModel article = new ArticleModel();
                if (Id != null)
                {
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
                        }
                    }
                }
                ViewBag.Service = apiService;
                return View(article);
            }
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
            ViewBag.Id = Id;
            ViewBag.Categories = GetArticleCategories();
            return View();
        }

        private Dictionary<string, string> GetArticleCategories()
        {
            var articleCategories = new Dictionary<string, string>();
            HttpClient client = new HttpClient();
            client.BaseAddress = new Uri(apiService);
            using (var response = client.GetAsync("api/Category").Result)
            {
                if (response.IsSuccessStatusCode)
                {
                    string scat = response.Content.ReadAsStringAsync().Result;
                    scat = scat.Replace("[", "").Replace("]", "").Replace('"', ' ');  // I don't like this
                    string[] cats = scat.Split(',');
                    foreach (string cat in cats)
                    {
                        articleCategories.Add(cat, cat);
                    }
                }
            }
            return articleCategories;
        }
    }
}