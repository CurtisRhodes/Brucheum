using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OggleBooble.Api.Core.Controllers
{
    public class EventController : Controller
    {
        private readonly MySqlDataContext myDbContext;
        public EventController(MySqlDataContext context)
        {
            myDbContext = context;
        }

        [HttpGet]
        [Route("Common/VerifyConnection")]
        public VerifyConnectionSuccessModel VerifyConnection()
        {
            VerifyConnectionSuccessModel successModel = new VerifyConnectionSuccessModel() { ConnectionVerified = false };
            //string success = "onon";
            try
            {
                var dbTest = myDbContext.CategoryFolders.Where(f => f.Id == 1).FirstOrDefault();
                if (dbTest != null)
                    successModel.ConnectionVerified = true;
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
