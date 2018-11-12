using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Mvc;

namespace Brucheum.Controllers
{
    public class AdminController : Controller
    {
        private string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];
        private ApplicationRoleManager _roleManager;
        public ApplicationRoleManager RoleManager
        {
            get
            {
                return _roleManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationRoleManager>();
                //return HttpContext.GetOwinContext().GetUserManager<ApplicationRoleManager>();
            }
            private set
            {
                _roleManager = value;
            }
        }

        public ActionResult Index()
        {
            ViewBag.Service = apiService;
            return View();
        }

        public JsonResult GetAllRoles()
        {
            string roles = "";  //Dictionary<string,string>();
            using (var context = new ApplicationDbContext())
            {
                //var roles = RoleManager.GetRoles();
                var roleStore = new RoleStore<IdentityRole>(context);
                var storeManager = new RoleManager<IdentityRole>(roleStore);
                IQueryable<IdentityRole> idRoles = storeManager.Roles;
                foreach (IdentityRole role in idRoles)
                {
                    //roles += "['id':'" + role.Id + "','Name':'" + role.Name + "']|";
                    roles += role.Id + "," + role.Name + "|";
                    //roles += "Id:"+ role.Id + ",Name:" + role.Name + "|";
                }
                roles = roles.Substring(0, roles.Length - 1);
                //roles += "]}";
            }
            return Json(roles,JsonRequestBehavior.AllowGet);
        }

        public string AddRole(string roleName)
        {
            string success = "";
            var roleModel = new RoleModel();
            try
            {
                roleModel = RoleManager.AddRole(roleName);
                success = roleModel.success;
            }
            catch (Exception ex) { roleModel.success = Helpers.ErrorDetails(ex); }
            return success;  //Json(roleModel, JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetUsers()
        {
            string users = "";  //Dictionary<string,string>();
            using (var context = new ApplicationDbContext())
            {
                System.Data.Entity.IDbSet<ApplicationUser> dbUsers = context.Users;
                foreach (ApplicationUser user in dbUsers)
                {
                    users += user.Id + "," + user.UserName + "|";
                }
                users = users.Substring(0, users.Length - 1);
            }
            return Json(users, JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetUserRoles(string userId)
        {
            return Json(RoleManager.GetRoles(userId), JsonRequestBehavior.AllowGet);
        }

        public JsonResult AddUserRole(string userId, string roleName)
        {
            return Json(RoleManager.AddUserRole(userId, roleName), JsonRequestBehavior.AllowGet);
        }

        public JsonResult RemoveUserRole(string userId, string roleName)
        {
            return Json(RoleManager.RemoveUserRole(userId, roleName), JsonRequestBehavior.AllowGet);
        }
    }
}