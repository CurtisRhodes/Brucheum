using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Models;
using WebApi.MySqDataContext;

namespace WebApi.Controllers
{
    [EnableCors("*", "*", "*")]
    public class RolesController : ApiController
    {
        [HttpPatch]
        public RoleModel GetRoles()
        {
            var roleModel = new RoleModel();
            try
            {
                using (OggleBoobleMySqContext db = new OggleBoobleMySqContext())
                {
                    roleModel.RoleNames = db.Roles.Select(r => r.RoleName).ToList();
                    roleModel.Success = "ok";
                }
            }
            catch (Exception ex) { roleModel.Success = Helpers.ErrorDetails(ex); }
            return roleModel;
        }

        [HttpPatch]
        public bool IsInRole(string userName, string roleName)
        {
            bool isInRole = false;
            using (OggleBoobleMySqContext db = new OggleBoobleMySqContext())
            {
                var isAdmin = db.UserRoles.Where(r => r.UserName == userName && r.RoleName == "Oggle Admin");
                if (isAdmin != null)
                    return true;

                UserRole userRole = db.UserRoles.Where(r => r.UserName == userName && r.RoleName == roleName).FirstOrDefault();
                isInRole = userRole != null;
            }
            return isInRole;
        }

        [HttpGet]
        public RoleModel GetUserRoles(string userName, string whichType)
        {
            RoleModel roleModel = new RoleModel();
            try
            {
                using (OggleBoobleMySqContext db = new OggleBoobleMySqContext())
                {
                    if (whichType == "Assigned")
                    {
                        var x = db.UserRoles.Where(ur => ur.UserName == userName).Select(ur => ur.RoleName).ToList();
                        roleModel.RoleNames = db.UserRoles.Where(ur => ur.UserName == userName).Select(ur => ur.RoleName).ToList();
                    }
                    if (whichType == "Available")
                    {
                        List<string> assigned = db.UserRoles.Where(ur => ur.UserName == userName).Select(ur => ur.RoleName).ToList();
                        List<string> allRoles = db.Roles.Select(r => r.RoleName).ToList();
                        foreach (string alreadyAssignedRole in assigned)
                        {
                            allRoles.Remove(alreadyAssignedRole);
                        }
                        roleModel.RoleNames = allRoles;
                    }
                    roleModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                roleModel.Success = Helpers.ErrorDetails(ex);                        
            }
            return roleModel;
        }

        [HttpPost]
        public string AddRole(string roleName)
        {
            string success = "";
            try
            {
                using (OggleBoobleMySqContext db = new OggleBoobleMySqContext())
                {
                    db.Roles.Add(new Role() { RoleName = roleName });
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPost]
        public string AddUserRole(string userName, string roleName)
        {
            string success = "";
            try
            {
                using (OggleBoobleMySqContext db = new OggleBoobleMySqContext())
                {
                    db.UserRoles.Add(new UserRole() { UserName = userName, RoleName = roleName });
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        public string UpdateRoleName(string roleName, string newName)
        {
            string success = "";
            try
            {
                using (OggleBoobleMySqContext db = new OggleBoobleMySqContext())
                {
                    Role roleToUpdate = db.Roles.Where(r => r.RoleName == roleName).First();
                    roleToUpdate.RoleName = newName;
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpDelete]
        public string RemoveUserRole(string userName, string roleName)
        {
            string success = "";
            try
            {
                using (OggleBoobleMySqContext db = new OggleBoobleMySqContext())
                {
                    UserRole roleToDelete = db.UserRoles.Where(r => r.UserName == userName && r.RoleName == roleName).First();
                    db.UserRoles.Remove(roleToDelete);
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }
}
