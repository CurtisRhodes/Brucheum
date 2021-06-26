using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OggleBooble.Core.Api.DataContext;
using OggleBooble.Core.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OggleBooble.Core.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VisitorController : ControllerBase
    {
        [HttpGet]
        [Route("api/Visitor/GetVisitorInfo")]
        public VisitorInfoSuccessModel GetVisitorInfo(string visitorId)
        {
            var visitorInfoModel = new VisitorInfoSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    Visitor dbVisitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                    if (dbVisitor == null)
                        visitorInfoModel.Success = "not found";
                    else
                    {
                        RegisteredUser dbRegisteredUser = db.RegisteredUsers.Where(u => u.VisitorId == visitorId).FirstOrDefault();
                        if (dbRegisteredUser == null)
                        {
                            visitorInfoModel.IsRegisteredUser = false;
                        }
                        else
                        {
                            visitorInfoModel.IsRegisteredUser = true;
                            visitorInfoModel.RegisteredUser = dbRegisteredUser;
                        }
                        visitorInfoModel.IpAddress = dbVisitor.IpAddress;
                        visitorInfoModel.Success = "ok";
                    }
                }
            }
            catch (Exception ex)
            {
                visitorInfoModel.Success = Helpers.ErrorDetails(ex);
            }
            return visitorInfoModel;
        }
    }
}
