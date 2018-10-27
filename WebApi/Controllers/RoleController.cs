using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Service1.Controllers
{
    [EnableCors("*", "*", "*")]
    public class RoleController : ApiController
    {
        [HttpPost]
        public string AddRole(string roleName)
        {
            string success = "";
            try
            {
                using (MSsecurityContext db = new MSsecurityContext())
                {
                    var newRole = new AspNetRole();
                    newRole.Id = Guid.NewGuid().ToString();
                    newRole.Name = roleName;
                    db.AspNetRoles.Add(newRole);
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = ex.Message;
            }
            return success;
        }

        [HttpGet]
        public IList<AspNetRole> Get()
        {
            var roles = new List<AspNetRole>();
            try
            {
                using (MSsecurityContext db = new MSsecurityContext())
                {
                    roles = (from row in db.AspNetRoles select row).ToList();
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex.InnerException);
            }
            return roles;
        }
    }
}
