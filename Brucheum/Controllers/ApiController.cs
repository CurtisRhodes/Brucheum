//using System;
//using System.Linq;
//using System.Threading.Tasks;
//using System.Collections.Generic;
//using System.Web.Mvc;
//using System.Web;
//using Microsoft.AspNet.Identity.Owin;
//using Microsoft.Owin.Security;
//using Microsoft.AspNet.Identity.EntityFramework;
//using Microsoft.AspNet.Identity;

using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Net.Mail;
using System.Web.Http;
using System.Web.Http.Results;




namespace Brucheum
{
    public class FileController : ApiController
    {
        // Write Static Pages 
        [HttpPost]
        public string Post()
        {
            string success = "oh no";
            try
            {
        
                
                success = "ok";
            }
            catch (Exception e)
            {
                success = e.Message;
            }
            return success;
        }

        //[HttpGet]
        //public string Get(string title)
        //{
        //    string success = "Not Found";
        //    //string title = xdoc.SelectSingleNode("//Article[@Id='" + Id + "']").Attributes["Title"].InnerText.Replace(" ", "_") + ".html";

        //    string htmlFileName = Path.Combine(filePath, title + ".html");
        //    if (File.Exists(filePath))
        //        success = htmlFileName;

        //    return success;
        //}
    }

    public class RoleController : ApiController
    {
        //private ApplicationRoleManager _roleManager;
        //public ApplicationRoleManager RoleManager
        //{
        //    get
        //    {
        //        return _roleManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationRoleManager>();
        //    }
        //    private set
        //    {
        //        _roleManager = value;
        //    }
        //}

        [HttpGet]
        public IList<RoleModel> Get()
        {
            IList<RoleModel> roles = new List<RoleModel>();
            using (var context = new ApplicationDbContext())
            {
                //var roles = RoleManager.GetRoles();
                var roleStore = new RoleStore<IdentityRole>(context);
                var storeManager = new RoleManager<IdentityRole>(roleStore);
                IQueryable<IdentityRole> idRoles = storeManager.Roles;
                foreach (IdentityRole role in idRoles)
                {
                    roles.Add(new RoleModel() { Id = role.Id, Name = role.Name });
                }
            }
            return roles;
        }

        //[HttpPost]
        //public string AddRole(string roleName)
        //{
        //    string success = "";
        //    try
        //    {
        //        RoleManager.AddRole(roleName);
        //    }
        //    catch (Exception ex)
        //    {
        //        success = ex.Message;
        //    }
        //    return success;
        //}

        //public ActionResult RoleIndex()
        //{
        //    List<string> roles;
        //    using (var context = new ApplicationDbContext())
        //    {
        //        var roleStore = new RoleStore<IdentityRole>(context);
        //        var roleManager = new RoleManager<IdentityRole>(roleStore);

        //        roles = (from r in roleManager.Roles select r.Name).ToList();
        //    }

        //    return View(roles.ToList());
        //}

    }

}
