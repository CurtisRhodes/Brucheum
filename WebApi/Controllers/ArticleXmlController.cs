using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Results;
using System.Xml;
using WebApi.Xml.Models;

namespace WebApi.Xml
{
    [EnableCors("*", "*", "*")]
    public class ArticleXmlController : ApiController
    {
        readonly string fileName = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Articles.xml");

        [HttpGet]
        public IEnumerable<ArticelXmlModel> Get(int pageLen, int page, string filterType, string filter)
        {
            IEnumerable<ArticelXmlModel> orderedList = new List<ArticelXmlModel>();
            var articleList = new List<ArticelXmlModel>();
            try
            {
                var regularList = new List<ArticelXmlModel>();
                XmlDocument xdoc = new XmlDocument();
                xdoc.Load(fileName);

                XmlNodeList entries = xdoc.SelectNodes("//Article");
                xdoc = null;
                foreach (XmlNode entry in entries)
                {
                    if (entry.Attributes["DateCreated"].InnerText != "")
                    {
                        //entry.Attributes["DateCreated"].InnerText = DateTime.Now.ToString();


                        articleList.Add(new ArticelXmlModel()
                        {
                            Id = entry.Attributes["Id"].InnerText,
                            Title = entry.Attributes["Title"].InnerText,
                            Summary = entry.ChildNodes[0].InnerText,
                            Byline = entry.Attributes["ByLine"].InnerText,
                            ImageName = entry.Attributes["ImageName"].InnerText,
                            Category = entry.Attributes["Category"].InnerText,
                            Contents = entry.ChildNodes[0].InnerText,
                            LastUpdated = Convert.ToDateTime(entry.Attributes["LastUpdated"].InnerText).ToShortDateString(),
                            DateCreated = Convert.ToDateTime(entry.Attributes["DateCreated"].InnerText).ToLongDateString(),
                            SortDate = Convert.ToDateTime(entry.Attributes["DateCreated"].InnerText).ToString("yyyyMMdd")

                        });
                    }
                }
                switch (filterType)
                {
                    case "Category":
                        foreach (ArticelXmlModel article in articleList)
                        {
                            if (article.Category.Trim().StartsWith(filter))
                            {
                                regularList.Add(article);
                            }
                        }
                        //regularList = articleList.Where(a => a.Category.Trim() == filter).ToList();
                        break;
                    case "Byline":
                        foreach (ArticelXmlModel article in articleList)
                        {
                            if (article.Byline.Trim().StartsWith(filter))
                            {
                                regularList.Add(article);
                            }
                        }
                        //regularList = articleList.Where(e => e.Byline == filter).ToList();
                        break;
                    default:
                        regularList = articleList;
                        break;
                }
                if (regularList.Count > 0)
                    orderedList = regularList;
                else
                    orderedList = articleList;

                orderedList = orderedList.OrderByDescending(e => e.SortDate).Skip((page - 1) * pageLen).Take(pageLen);
            }
            catch (Exception e)
            {
                articleList.Add(new ArticelXmlModel() { Title = "ERROR", Summary = e.Message });
                orderedList = articleList;
            }
            return orderedList;
        }

        [HttpGet]
        public JsonResult<ArticelXmlModel> Get(string Id)
        {
            var article = new ArticelXmlModel();
            try
            {
                XmlDocument xdoc = new XmlDocument();
                xdoc.Load(fileName);
                XmlNode node = xdoc.SelectSingleNode("//Article[@Id='" + Id + "']");
                xdoc = null;
                article.Id = Id;
                article.Title = node.Attributes["Title"].InnerText;
                article.Category = node.Attributes["Category"].InnerText;
                article.Byline = node.Attributes["ByLine"].InnerText;
                article.ImageName = node.Attributes["ImageName"].InnerText;
                article.DateCreated = DateTime.Parse(node.Attributes["DateCreated"].InnerText).ToShortDateString();
                //article.DateCreated = Convert.ToDateTime(node.Attributes["DateCreated"].InnerText).ToString("MM/dd/yyyy");


                article.Summary = node.ChildNodes[1].InnerText;
                article.Contents = node.ChildNodes[0].InnerText;



                if (node.ChildNodes[2] != null)
                {
                    IList<string> tags = new List<string>();
                    foreach (XmlNode tag in node.ChildNodes[2])
                    {
                        tags.Add(tag.InnerText);
                    }
                    article.Tags = tags.ToArray();
                }
            }
            catch (Exception ex)
            {
                article.Title = "ERROR: " + ex.Message;
            }
            return Json(article);
        }

        [HttpGet]
        public IList<ArticelXmlModel> Get()
        {
            var articleList = new List<ArticelXmlModel>();
            try
            {
                XmlDocument xdoc = new XmlDocument();
                xdoc.Load(fileName);
                XmlNodeList entries = xdoc.SelectNodes("//Article");
                foreach (XmlNode entry in entries)
                {
                    var model = new ArticelXmlModel();
                    model.Id = entry.Attributes["Id"].InnerText;
                    model.Title = entry.Attributes["Title"].InnerText;
                    model.Byline = entry.Attributes["ByLine"].InnerText;
                    model.ImageName = entry.Attributes["ImageName"].InnerText;
                    model.Category = entry.Attributes["Category"].InnerText;
                    model.Updated = DateTime.Parse(entry.Attributes["LastUpdated"].InnerText);
                    model.Created = DateTime.Parse(entry.Attributes["DateCreated"].InnerText);
                    model.LastUpdated = Convert.ToDateTime(entry.Attributes["LastUpdated"].InnerText).ToShortDateString();
                    model.DateCreated = Convert.ToDateTime(entry.Attributes["DateCreated"].InnerText).ToLongDateString();
                    model.SortDate = Convert.ToDateTime(entry.Attributes["DateCreated"].InnerText).ToString("yyyyMMdd");
                    model.Contents = entry.ChildNodes[0].InnerText;
                    model.Summary = entry.ChildNodes[1].InnerText;
                    if (entry.ChildNodes[2] != null)
                    {
                        IList<string> tags = new List<string>();
                        foreach (XmlNode tag in entry.ChildNodes[2])
                        {
                            tags.Add(tag.InnerText);
                        }
                        model.Tags = tags.ToArray();
                    }
                    articleList.Add(model);
                }
            }
            catch (Exception e)
            {
                articleList.Add(new ArticelXmlModel() { Title = "ERROR", Summary = e.Message });
            }
            return articleList;
        }

        //[HttpPatch]
        //public IList<DbArticleModel> ConvertForDb()
        //{
        //    var articleList = new List<Article.DbArticleModel>();
        //    try
        //    {
        //        XmlDocument xdoc = new XmlDocument();
        //        xdoc.Load(fileName);
        //        XmlNodeList entries = xdoc.SelectNodes("//Article");
        //        foreach (XmlNode entry in entries)
        //        {
        //            var dbMmodel = new Articles.Models.DbArticleModel();
        //            dbMmodel.Id = entry.Attributes["Id"].InnerText;
        //            dbMmodel.Title = entry.Attributes["Title"].InnerText;
        //            dbMmodel.ByLineRef = entry.Attributes["ByLine"].InnerText;
        //            dbMmodel.ImageName = entry.Attributes["ImageName"].InnerText;
        //            dbMmodel.CategoryRef = entry.Attributes["Category"].InnerText;
        //            dbMmodel.Updated = DateTime.Parse(entry.Attributes["LastUpdated"].InnerText);
        //            dbMmodel.Created = DateTime.Parse(entry.Attributes["DateCreated"].InnerText);
        //            dbMmodel.LastUpdated = Convert.ToDateTime(entry.Attributes["LastUpdated"].InnerText).ToShortDateString();
        //            dbMmodel.Created = Convert.ToDateTime(entry.Attributes["DateCreated"].InnerText);
        //            //dbMmodel.SortDate = Convert.ToDateTime(entry.Attributes["DateCreated"].InnerText).ToString("yyyyMMdd");
        //            dbMmodel.Summary = entry.ChildNodes[0].InnerText;
        //            dbMmodel.Contents = entry.ChildNodes[1].InnerText;
        //            if (entry.ChildNodes[2] != null)
        //            {
        //                IList<string> tags = new List<string>();
        //                foreach (XmlNode tag in entry.ChildNodes[2])
        //                {
        //                    if ((tag.InnerText != null) && (tag.InnerText != "tag1"))
        //                        dbMmodel.Tags.Add(new Articles.Models.DbArticleTagModel() { TagName = tag.InnerText });
        //                }
        //            }
        //            articleList.Add(dbMmodel);
        //        }
        //    }
        //    catch (Exception e)
        //    {
        //        articleList.Append(new Articles.Models.DbArticleModel() { Title = "ERROR", Summary = e.Message });
        //    }
        //    return articleList;
        //}



        [HttpPost]
        public string Post(ArticelXmlModel model)
        {
            try
            {
                XmlDocument xdoc = new XmlDocument();
                xdoc.Load(fileName);
                XmlNode xmlNode = null;
                string id = Guid.NewGuid().ToString();

                xmlNode = xdoc.CreateElement("Article");
                XmlAttribute articleId = xdoc.CreateAttribute("Id"); articleId.Value = id; xmlNode.Attributes.Append(articleId);
                XmlAttribute title = xdoc.CreateAttribute("Title"); title.Value = model.Title; xmlNode.Attributes.Append(title);
                XmlAttribute category = xdoc.CreateAttribute("Category"); category.Value = model.Category; xmlNode.Attributes.Append(category);
                XmlAttribute byLine = xdoc.CreateAttribute("ByLine"); byLine.Value = model.Byline; xmlNode.Attributes.Append(byLine);
                XmlAttribute imageName = xdoc.CreateAttribute("ImageName"); imageName.Value = model.ImageName; xmlNode.Attributes.Append(imageName);
                XmlElement summary = xdoc.CreateElement("Summary"); summary.InnerText = model.Summary; xmlNode.AppendChild(summary);
                XmlElement contents = xdoc.CreateElement("Contents"); XmlCDataSection cdata = xdoc.CreateCDataSection(model.Contents); contents.AppendChild(cdata); xmlNode.AppendChild(contents);

                XmlAttribute dateCreated = xdoc.CreateAttribute("DateCreated"); dateCreated.Value = DateTime.Now.ToString(); xmlNode.Attributes.Append(dateCreated);
                XmlAttribute lastUpdated = xdoc.CreateAttribute("LastUpdated"); lastUpdated.Value = DateTime.Now.ToString(); xmlNode.Attributes.Append(lastUpdated);

                XmlElement tags = xdoc.CreateElement("Tags");
                if ((model.Tags != null) && (model.Tags.Count() > 0))
                {
                    foreach (string metTag in model.Tags)
                    {
                        XmlElement tag = xdoc.CreateElement("Tag");
                        tag.InnerText = metTag;
                        tags.AppendChild(tag);
                    }
                }
                xmlNode.AppendChild(tags);

                xdoc.DocumentElement.AppendChild(xmlNode);
                xdoc.Save(fileName);
                xdoc = null;
                return id;
            }
            catch (Exception e)
            {
                return "ERROR: "+ e.Message;
            }
        }

        [HttpPut]
        public string Put(ArticelXmlModel model)
        {
            string success = "ERROR unknown";
            try
            {
                XmlDocument xdoc = new XmlDocument();
                xdoc.Load(fileName);
                XmlNode xmlNode = xdoc.SelectSingleNode("//Article[@Id='" + model.Id + "']");
                if (xmlNode != null)
                {
                    xmlNode.Attributes["Title"].Value = model.Title;
                    xmlNode.Attributes["LastUpdated"].Value = DateTime.Now.ToString();
                    xmlNode.Attributes["Category"].Value = model.Category;
                    xmlNode.Attributes["ByLine"].Value = model.Byline;
                    xmlNode.Attributes["ImageName"].Value = model.ImageName;
                    xmlNode.Attributes["DateCreated"].Value = model.DateCreated;
                    xmlNode.ChildNodes[0].InnerText = model.Summary;
                    XmlCDataSection cdata = xdoc.CreateCDataSection(model.Contents);
                    xmlNode.ChildNodes[1].RemoveAll();
                    xmlNode.ChildNodes[1].AppendChild(cdata);

                    if (model.Tags != null)
                    {
                        if (xmlNode.ChildNodes.Count < 3)
                        {
                            XmlElement tags = xdoc.CreateElement("Tags");
                            xmlNode.AppendChild(tags);
                        }

                        xmlNode.ChildNodes[2].RemoveAll();
                        foreach (string metTag in model.Tags)
                        {
                            if (metTag != null)
                            {
                                XmlElement tag = xdoc.CreateElement("Tag");
                                tag.InnerText = metTag;
                                xmlNode.ChildNodes[2].AppendChild(tag);
                            }
                        }
                    }
                    xdoc.Save(fileName);
                    success = "ok";
                }
                else
                    success = "article not found";
            }
            catch (Exception e)
            {
                success = "ERROR: " + e.Message;
            }
            return success;
        }

        // DELETE: api/Article/5
        public void Delete(int id)
        {
        }
    }

    [EnableCors("*", "*", "*")]
    public class StaticFilesController : ApiController
    {
        // Write Static Pages 
        [HttpPost]
        public string Post()
        {
            string success = "";
            try
            {
                string filePath = System.Web.HttpContext.Current.Server.MapPath("~/Static_Pages");
                string html = Request.Content.ReadAsStringAsync().Result;
                string fileName = html.Substring(html.IndexOf("divTitle") + 10, 500);
                fileName = filePath + "/" + fileName.Substring(0, fileName.IndexOf("</div>")).Replace(" ", "_") + ".html";

                using (var staticFile = File.Open(fileName, FileMode.OpenOrCreate))
                {
                    Byte[] byteArray = Encoding.ASCII.GetBytes(html);
                    staticFile.Write(byteArray, 0, byteArray.Length);
                }
                //File.WriteAllBytes(fileName, byteArray);                
                success = "ok";
            }
            catch (Exception e) { success = Helpers.ErrorDetails(e); }
            return success;
        }
    }

}
