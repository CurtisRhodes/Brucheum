using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.Linq;
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

        // GET: Admin
        public ActionResult Index()
        {
            ViewBag.Service = apiService;
            return View();
        }

        [HttpGet]
        [AllowAnonymous]
        public JsonResult GetRoles()
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

        [HttpPost]
        public string AddRole(string roleName)
        {
            string success = "";
            try
            {
                success = RoleManager.AddRole(roleName);
            }
            catch (Exception ex)
            {
                success = ex.Message;
            }
            return success;
        }
    }
}