using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Bruch.Api.Controllers
{
    [System.Web.Http.Cors.EnableCors("*", "*", "*")]
    public class ImagesController : ApiController
    {
        private readonly string destiationPath = "http://library.curtisrhodes.com/article Jogs/";
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];  //  ftp://50.62.160.105/
        private readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        private readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];

        [HttpGet]
        public string AddImage(string imageFullFileName)
        {
            string success;
            try
            {
                NetworkCredential networkCredentials = new NetworkCredential(ftpUserName, ftpPassword);
                string appDataPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/temp/");
                string extension = imageFullFileName.Substring(imageFullFileName.LastIndexOf("."));
                string newFileName = imageFullFileName.Substring(imageFullFileName.LastIndexOf("/"));
                // USE WEBCLIENT TO CREATE THE FILE
                using (WebClient wc = new WebClient())
                {
                    wc.DownloadFile(new Uri(imageFullFileName), appDataPath + "tempImage" + extension);
                }
                FtpWebRequest webRequest = null;
                // USE WEBREQUEST TO UPLOAD THE FILE
                string ftpPath = ftpHost + destiationPath;
                webRequest = (FtpWebRequest)WebRequest.Create(ftpPath + "/" + newFileName);
                webRequest.Credentials = networkCredentials;
                // TAKE THE WEBREQUEST FILE STREAM TO 
                using (Stream requestStream = webRequest.GetRequestStream())
                {
                    byte[] fileContents = System.IO.File.ReadAllBytes(appDataPath + "tempImage" + extension);
                    webRequest.ContentLength = fileContents.Length;
                    requestStream.Write(fileContents, 0, fileContents.Length);
                    requestStream.Flush();
                    requestStream.Close();
                }
                DirectoryInfo directory = new DirectoryInfo(appDataPath);
                FileInfo tempFile = directory.GetFiles("tempImage" + extension).FirstOrDefault();
                if (tempFile != null)
                    tempFile.Delete();

                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }
    }
}
