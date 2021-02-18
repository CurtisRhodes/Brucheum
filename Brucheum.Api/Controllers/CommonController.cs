using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Bruchem.Api
{
    [EnableCors("*", "*", "*")]
    public class CommonController : ApiController
    {
        [HttpGet]
        public string VerifyConnection()
        {
            string success = "ono";
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    var dbTest = db.Refs.FirstOrDefault();
                    success = "ok";
                }
                timer.Stop();
                //successModel.ReturnValue = timer.Elapsed.ToString();
                //System.Diagnostics.Debug.WriteLine("VerifyConnection took: " + timer.Elapsed);
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }
    }
}