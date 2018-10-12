using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Http;

namespace Brucheum.Controllers
{
    public class FileController : ApiController
    {
        // Write Static Pages 
        [HttpPost]
        public string Post()
        {
            string success = "oh no";
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
            catch (Exception e)
            {
                success = e.Message;
            }
            return success;
        }

        //[HttpGet]
        //public string Get(string title)
        //{
        //    string success = "Not Found";
        //    //string title = xdoc.SelectSingleNode("//Article[@Id='" + Id + "']").Attributes["Title"].InnerText.Replace(" ", "_") + ".html";

        //    string htmlFileName = Path.Combine(filePath, title + ".html");
        //    if (File.Exists(filePath))
        //        success = htmlFileName;

        //    return success;
        //}
    }
}
