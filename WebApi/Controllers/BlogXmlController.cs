using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Results;
using System.Xml;

namespace WebApi.Xml
{

    [EnableCors("*", "*", "*")]
    public class JournalController : ApiController
    {
        readonly string fileName = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Journal.xml");

        [HttpGet]
        public IOrderedEnumerable<JournalEntry> Get()
        {
            var nodeList = new List<JournalEntry>();
            try
            {
                XmlDocument xdoc = new XmlDocument();
                xdoc.Load(fileName);
                XmlNodeList entries = xdoc.SelectNodes("//Entry");

                foreach (XmlNode entry in entries)
                {
                    nodeList.Add(new JournalEntry()
                    {
                        Id = entry.Attributes["Id"].InnerText,
                        Title = entry.Attributes["Title"].InnerText,
                        DateCreated = Convert.ToDateTime(entry.Attributes["DateCreated"].InnerText).ToString("MM/dd/yyyy"),
                        SortDate = Convert.ToDateTime(entry.Attributes["DateCreated"].InnerText).ToString("yyyy-MM-dd")
                    });
                }

            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
            var orderedList = nodeList.OrderByDescending(e => e.SortDate);

            return orderedList;
        }

        [HttpGet]
        public JsonResult<JournalEntry> Get(string Id)
        {
            XmlDocument xdoc = new XmlDocument();
            xdoc.Load(fileName);
            XmlNode node = xdoc.SelectSingleNode("//Entry[@Id='" + Id + "']");

            var entry = new JournalEntry();
            entry.DateCreated = Convert.ToDateTime(node.Attributes["DateCreated"].InnerText).ToString("MM/dd/yyyy");
            entry.Title = node.Attributes["Title"].InnerText;
            entry.Id = Id;
            entry.Content = node.ChildNodes[0].InnerText;
            return Json(entry);
        }

        [HttpPost]
        public string Post(JournalEntry entry)
        {
            XmlDocument xdoc = new XmlDocument();
            xdoc.Load(fileName);
            XmlNode xmlNode = null;
            string id = entry.Id;
            id = Guid.NewGuid().ToString();

            xmlNode = xdoc.CreateElement("Entry");
            XmlAttribute Id = xdoc.CreateAttribute("Id"); Id.Value = id; xmlNode.Attributes.Append(Id);
            XmlAttribute Title = xdoc.CreateAttribute("Title"); Title.Value = entry.Title; xmlNode.Attributes.Append(Title);
            XmlAttribute DateCreated = xdoc.CreateAttribute("DateCreated"); DateCreated.Value = DateTime.UtcNow.ToShortDateString(); xmlNode.Attributes.Append(DateCreated);
            XmlNode Contents = xdoc.CreateCDataSection(entry.Content); xmlNode.AppendChild(Contents);

            xdoc.DocumentElement.AppendChild(xmlNode);
            xdoc.Save(fileName);
            return id;
        }

        [HttpPut]
        public void Put(JournalEntry blogEntry)
        {
            XmlDocument xdoc = new XmlDocument();
            xdoc.Load(fileName);
            XmlNode xmlNode = null;
            xmlNode = xdoc.SelectSingleNode("//Entry[@Id='" + blogEntry.Id + "']");
            xmlNode.Attributes["Title"].Value = blogEntry.Title;
            xmlNode.ChildNodes[0].Value = blogEntry.Content;
            xdoc.Save(fileName);
        }

        [HttpDelete]
        public void delete(string Id)
        {
            XmlDocument xdoc = new XmlDocument();
            xdoc.Load(fileName);
            var xmlNode = xdoc.SelectSingleNode("//Entry[@Id='" + Id + "']");
            var root = xdoc.SelectSingleNode("Journal");
            root.RemoveChild(xmlNode);
            xdoc.Save(fileName);
        }
    }



    public class JournalEntry
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string DateCreated { get; set; }
        public string SortDate { get; set; }
    }
}