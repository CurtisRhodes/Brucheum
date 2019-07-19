using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.UI.WebControls;
using WebApi.Ftp;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class ImagesController : ApiController
    {
        private readonly string imagesPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Images");

        // POST: api/Image
        [HttpPost]
        public string Post(string oFileName)
        {
            //string fileName = GetRandomString()+ ".jpg";

            var fullPathImageFileName = Path.Combine(imagesPath, oFileName);
            Byte[] byteArray = Request.Content.ReadAsByteArrayAsync().Result;
            File.WriteAllBytes(fullPathImageFileName, byteArray);

            return "ok";
        }

        //GET api/Image/filename
        [HttpGet]
        public byte[] Get(string fileName)
        {
            var image = File.OpenRead(Path.Combine(imagesPath, fileName));
            using (MemoryStream ms = new MemoryStream())
            {
                image.CopyTo(ms);
                var x = ms.ToArray();
                return ms.ToArray();
            }
        }


        string mmGetTenDigitRandomNumber()
        {
            Random generator = new Random();
            return generator.Next(0, 1000000).ToString("D10");
        }
    }
    [EnableCors("*", "*", "*")]
    public class TransitionsController : ApiController
    {
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        //static readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        //static readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];

        [HttpGet]
        public string[] GetImages(string folderName)
        {
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            string transitionsLocation = "library.curtisrhodes.com/transitions/";
            //TransitionModel transitionModel = new TransitionModel();
            List<string> pics = new List<string>();
            string ftpPath = ftpHost + transitionsLocation + folderName;
            string[] files = FtpUtilies.GetFiles(ftpPath);
            foreach (string imagegFileName in files)
            {
                pics.Add("http://" + transitionsLocation + "/" + folderName + "/" + imagegFileName);
            };
            timer.Stop();
            System.Diagnostics.Debug.WriteLine("GetImageLinks took: " + timer.Elapsed);
            return pics.ToArray();
        }
    }
    public class TransitionModel
    {
        public TransitionModel()
        {
            List<string> Image1 = new List<string>();
            List<string> Image2 = new List<string>();
        }
        public List<string> Image1 { get; set; }
        public List<string> Image2 { get; set; }
        public string success { get; set; }
    }


    //public class TransitionModel
    //{
    //    public TransitionModel()
    //    {
    //        List<Image> Image1 = new List<Image>();
    //        List<Image> Image2 = new List<Image>();
    //    }
    //    public List<Image> Image1 { get; set; }
    //    public List<Image> Image2 { get; set; }
    //    public string success { get; set; }

    //}
}