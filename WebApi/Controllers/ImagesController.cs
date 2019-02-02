using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Service1.Controllers
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
}
