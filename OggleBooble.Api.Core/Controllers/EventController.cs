using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OggleBooble.Api.Core.Controllers
{
    //[Route("api/[controller]")]
    //[ApiController]
    public class EventController : Controller
    {
        private readonly MySqlDataContext myDbContext;
        private readonly IHostEnvironment _env;

        public EventController(MySqlDataContext context, IHostEnvironment env)
        {
            myDbContext = context;
            _env = env;
        }

        [HttpGet]
        [Route("Common/VerifyConnection")]
        public VerifyConnectionSuccessModel VerifyConnection()
        {
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            VerifyConnectionSuccessModel successModel = new VerifyConnectionSuccessModel() { ConnectionVerified = false };
            try
            {
                //using (var db = new OggleBoobleMSSqlContext())
                //using (var db = new myDbContext)
                {
                    var dbTest = myDbContext.CategoryFolders.Where(f => f.Id == 1).FirstOrDefault();
                    successModel.ConnectionVerified = (dbTest != null);
                }
                timer.Stop();
                //successModel.ReturnValue = timer.Elapsed.ToString();
                System.Diagnostics.Debug.WriteLine("VerifyConnection took: " + timer.Elapsed);
                successModel.Success = "ok";
            }
            catch (Exception ex)
            {
                successModel.Success = Helpers.ErrorDetails(ex);
            }
            return successModel;
        }


    }
}
