using OggleBooble.Api.Models;
using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace OggleBooble.Api.Controllers
{
    public class RolesController : ApiController
    {
        [HttpGet]
        [Route("api/Roles/GetUserRoles")]
        public List<string> GetUserRoles(string visitorId)
        {
            var roles = new List<string>();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    roles = db.UserRoles.Where(r => r.VisitorId == visitorId).Select(r => r.RoleId).ToList();
                }
            }
            catch (Exception ex)
            {
                roles.Add(Helpers.ErrorDetails(ex));
            }
            return roles;
        }

        [HttpGet]
        [Route("api/Roles/GetRegisteredUsers")]
        public RegisteredUsersSuccessModel GetRegisteredUsers()
        {
            var registeredUsersSuccess = new RegisteredUsersSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    registeredUsersSuccess.RegisteredUsers =
                        (from u in db.RegisteredUsers
                         select new UsersModel()
                         {
                             UserName = u.UserName,
                             VisitorId = u.VisitorId
                         }).ToList();
                    registeredUsersSuccess.Success = "ok";
                }
            }
            catch (Exception ex) { registeredUsersSuccess.Success = Helpers.ErrorDetails(ex); }
            return registeredUsersSuccess;
        }
    }
}
