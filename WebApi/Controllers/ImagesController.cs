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
        string imagesPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Images");

        // POST: api/Image
        [HttpPost]
        public string Post()
        {
            string fileName = GetRandomString()+ ".jpg";
            var fullPathImageFileName = Path.Combine(imagesPath, fileName);

            Byte[] byteArray = Request.Content.ReadAsByteArrayAsync().Result;
            File.WriteAllBytes(fullPathImageFileName, byteArray);

            return fileName;
        }

        //GET api/Image/filename
       [HttpGet]
        public byte[] Get(string id)
        {
            //var z = Path.Combine(imagesPath, id);
            var image = File.OpenRead(Path.Combine(imagesPath, id));
            using (MemoryStream ms = new MemoryStream())
            {
                image.CopyTo(ms);
                var x = ms.ToArray();
                return ms.ToArray();
            }
        }

        private static Random random = new Random();
        string GetRandomString(int length = 12)
        {
            const string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            return new string(Enumerable.Repeat(chars, length)
              .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        string GetTenDigitRandomNumber()
        {
            Random generator = new Random();
            return generator.Next(0, 1000000).ToString("D10");
        }
    }
}
