using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Http;
using System.Web.Http.Results;
using System.Xml;
using System.Xml.Linq;
using WebApi.Models;

namespace WebApi.Controllers
{
    public class BookController : ApiController
    {
        [HttpGet]
        public string GetEntireBook(string bookTitle)
        {
            try
            {
                var xDocument = XDocument.Load(GetXmlFile(bookTitle));
                var builder = new StringBuilder();
                JsonSerializer.Create().Serialize(new CleanXmlAttributesJsonWriter(new StringWriter(builder)), xDocument);
                var serialized = builder.ToString();

                string strXml = builder.ToString();//.Substring(52);

                strXml = strXml.Replace("cdata-section", "Contents");

                return strXml;
            }
            catch (Exception e) { return e.Message; }
        }

        [HttpGet]
        public JsonResult<BookModel> Get(string bookTitle, string chapterId, string sectionId, string subSectionId)
        {
            if (sectionId == "undefined") sectionId = null;
            if (subSectionId == "undefined") subSectionId = null;
            var bookModel = new BookModel() { BookTitle = bookTitle, ChapterId = chapterId, SectionId = sectionId, SubSectionId = subSectionId };
            try
            {
                if (chapterId != null)
                {
                    var xdoc = new XmlDocument(); xdoc.Load(GetXmlFile(bookTitle));
                    var chapter = xdoc.SelectSingleNode("//Chapter[@Id='" + bookModel.ChapterId + "']");
                    bookModel.ChapterTitle = chapter.Attributes["Title"].Value;
                    bookModel.ChapterOrder = chapter.Attributes["Order"].Value;
                    if (bookModel.SectionId != null)
                    {
                        var section = chapter.SelectSingleNode("//Section[@Id='" + bookModel.SectionId + "']");
                        bookModel.SectionTitle = section.Attributes["Title"].Value;
                        if (subSectionId != null)
                        {
                            var subSection = section.SelectSingleNode("//SubSection[@Id = '" + bookModel.SubSectionId + "']");
                            bookModel.SubSectionTitle = subSection.Attributes["Title"].Value;
                            bookModel.Contents = subSection.ChildNodes[0].InnerText;
                        }
                        else
                            bookModel.Contents = section.ChildNodes[0].InnerText;
                    }
                    else
                        bookModel.Contents = chapter.ChildNodes[0].InnerText;
                    bookModel.success = "ok";
                    xdoc = null;
                }
            }
            catch (Exception e)
            {
                bookModel.success = e.Message;
            }
            return Json(bookModel);
        }

        [HttpPost]
        public JsonResult<BookModel> Post(BookModel model)
        {
            model.success = "oh no";
            try
            {
                var xmlFile = GetXmlFile(model.BookTitle);
                var xdoc = new XmlDocument(); xdoc.Load(xmlFile);
                XmlNode chapter = xdoc.CreateElement("Chapter");
                var Id = xdoc.CreateAttribute("Id"); Id.Value = Guid.NewGuid().ToString(); chapter.Attributes.Append(Id);
                var title = xdoc.CreateAttribute("Title"); title.Value = model.ChapterTitle; chapter.Attributes.Append(title);
                var order = xdoc.CreateAttribute("Order"); order.Value = model.ChapterOrder; chapter.Attributes.Append(order);
                //var dateCreated = xdoc.CreateAttribute("DateCreated"); dateCreated.Value = DateTime.Now.ToString();chapter.Attributes.Append(dateCreated);

                xdoc.DocumentElement.AppendChild(chapter);
                model.ChapterId = Id.Value;

                XmlNode section = CreateSection(xdoc, model);
                chapter.AppendChild(section);

                if (model.SubSectionTitle != null)
                {
                    XmlNode subSection = CreateSubSection(xdoc, model);
                    subSection.ChildNodes[0].InnerText = model.Contents;
                    section.AppendChild(subSection);
                }
                else // no sub section specified in model. place data in Section
                {
                    section.ChildNodes[0].InnerText = model.Contents;
                }
                xdoc.Save(xmlFile);
                model.success = "ok";
            }
            catch (Exception e)
            {
                model.success = "POST Error: " + e.Message;
            }
            return Json(model);
        }

        [HttpPut]
        public JsonResult<BookModel> Put(BookModel model)
        {
            try
            {
                var xmlFile = GetXmlFile(model.BookTitle);
                var xdoc = new XmlDocument(); xdoc.Load(xmlFile);
                var chapter = xdoc.SelectSingleNode("//Chapter[@Id='" + model.ChapterId + "']");
                chapter.Attributes["Title"].Value = model.ChapterTitle;

                var section = chapter.SelectSingleNode("//Section[@Id='" + model.SectionId + "']");
                if (model.SubSectionTitle != null)
                {
                    if (model.SubSectionId == null)
                    {
                        var subSection = CreateSubSection(xdoc, model);
                        section.AppendChild(subSection);
                    }
                    else
                    {
                        var subSection = section.SelectSingleNode("//SubSection[@Id='" + model.SubSectionId + "']");
                        subSection.Attributes["LastUpdated"].Value = DateTime.Now.ToString();
                        subSection.Attributes["Title"].Value = model.SubSectionTitle;
                        subSection.ChildNodes[0].InnerText = model.Contents;
                    }
                }
                else
                {
                    if (model.SectionId == null)
                    {
                        section = CreateSection(xdoc, model);
                        chapter.AppendChild(section);
                    }
                    else
                    {
                        section.Attributes["LastUpdated"].Value = DateTime.Now.ToString(); ;
                        section.Attributes["Title"].Value = model.SectionTitle;
                    }
                    section.ChildNodes[0].InnerText = model.Contents;
                }
                xdoc.Save(xmlFile);
                model.success = "ok";
            }
            catch (Exception e) { model.success = "PUT Error: " + e.Message; }
            return Json(model);
        }

        // helper functions
        private XmlNode CreateSection(XmlDocument xdoc, BookModel model)
        {
            XmlNode section = xdoc.CreateElement("Section");
            var Id = xdoc.CreateAttribute("Id");
            Id.Value = Guid.NewGuid().ToString();
            section.Attributes.Append(Id);
            var title = xdoc.CreateAttribute("Title");
            title.Value = model.SectionTitle;
            section.Attributes.Append(title);
            var dateCreated = xdoc.CreateAttribute("DateCreated");
            dateCreated.Value = DateTime.Now.ToString();
            section.Attributes.Append(dateCreated);
            var lastUpdated = xdoc.CreateAttribute("LastUpdated");
            lastUpdated.Value = DateTime.Now.ToString();
            section.Attributes.Append(lastUpdated);
            var cdata = xdoc.CreateCDataSection("");
            section.AppendChild(cdata);
            model.SectionId = Id.Value;
            return section;
        }

        private XmlNode CreateSubSection(XmlDocument xdoc, BookModel model)
        {
            var subSection = xdoc.CreateElement("SubSection");
            var Id = xdoc.CreateAttribute("Id");
            Id.Value = Guid.NewGuid().ToString();
            subSection.Attributes.Append(Id);
            var title = xdoc.CreateAttribute("Title");
            title.Value = model.SubSectionTitle;
            subSection.Attributes.Append(title);
            var dateCreated = xdoc.CreateAttribute("DateCreated");
            dateCreated.Value = DateTime.Now.ToString();
            subSection.Attributes.Append(dateCreated);
            var lastUpdated = xdoc.CreateAttribute("LastUpdated");
            lastUpdated.Value = DateTime.Now.ToString();
            subSection.Attributes.Append(lastUpdated);
            var cdata = xdoc.CreateCDataSection(model.Contents);
            subSection.AppendChild(cdata);
            model.SubSectionId = Id.Value;
            return subSection;
        }

        private string GetXmlFile(string bookTitle)
        {
            switch (bookTitle)
            {
                case "Ready; Fire; Aim":
                    return System.Web.HttpContext.Current.Server.MapPath("~/App_Data/ReadyFireAim.xml"); ;
                case "Time Squared":
                    return System.Web.HttpContext.Current.Server.MapPath("~/App_Data/TimeSquared.xml"); ;
                case "The Blond Jew":
                    return System.Web.HttpContext.Current.Server.MapPath("~/App_Data/BlondJew.xml"); ;
                default:
                    return "";
            }
        }
    }
    public class CleanXmlAttributesJsonWriter : JsonTextWriter
    {
        public CleanXmlAttributesJsonWriter(TextWriter writer) : base(writer) { }

        public override void WritePropertyName(string name)
        {
            if (name.StartsWith("@") || name.StartsWith("#"))
            {
                base.WritePropertyName(name.Substring(1));
            }
            else
            {
                base.WritePropertyName(name);
            }
        }

    }
}
