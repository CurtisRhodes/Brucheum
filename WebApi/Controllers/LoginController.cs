using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.DataContext;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class LoginController : ApiController
    {
        [HttpGet]
        public UsersModel GetUsers()
        {
            UsersModel users = new UsersModel();
            try
            {
                using (WebStatsContext db = new WebStatsContext())
                {
                    users.UserNames = db.RegisteredUsers.Select(r => r.UserName).ToList();
                    users.Success = "ok";
                }
            }
            catch (Exception ex) { users.Success = Helpers.ErrorDetails(ex); }
            return users;
        }

        [HttpGet]
        public string VerifyLogin(string userName, string passWord)
        {
            string success = "";
            using (WebStatsContext db = new WebStatsContext())
            {
                string encryptedPassword = HashSHA256(passWord);
                RegisteredUser dbRegisteredUser = db.RegisteredUsers.Where(u => u.UserName == userName && u.Pswrd == encryptedPassword).FirstOrDefault();
                if (dbRegisteredUser != null)
                    success = "ok";
                else
                {
                    dbRegisteredUser = db.RegisteredUsers.Where(u => u.UserName == userName).FirstOrDefault();
                    if (dbRegisteredUser == null)
                        success = "user name not found";
                    else
                        success = "password fail";
                }
            }
            return success;
        }

        [HttpGet]
        public List<UserRoleModel> UserPermissions(string userName)
        {
            List<UserRoleModel> roles = null;
            using (WebStatsContext db = new WebStatsContext())
            {
                roles = (from u in db.UserRoles
                         join r in db.Roles on u.RoleName equals r.RoleName
                         where u.UserName == userName
                         select new UserRoleModel()
                         {
                             UserName = userName,
                             RoleName = r.RoleName
                         }
                         ).ToList();
            }
            return roles;
        }

        [HttpPost]
        public string RegisterUser(RegisteredUser registeredUserModel)
        {
            string success = "";
            try
            {
                using (WebStatsContext db = new WebStatsContext())
                {
                    RegisteredUser dbRegisteredUser = db.RegisteredUsers.Where(u => u.UserName == registeredUserModel.UserName).FirstOrDefault();
                    if (dbRegisteredUser != null)
                        success = "user name already exists";
                    else
                    {
                        registeredUserModel.Pswrd = HashSHA256(registeredUserModel.Pswrd);
                        registeredUserModel.CreateDate = DateTime.Now;
                        //registeredUserModel.IpAddress = Helpers.GetIPAddress();
                        db.RegisteredUsers.Add(registeredUserModel);
                        db.SaveChanges();

                        success = "ok";
                    }
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        private static string HashSHA256(string value)
        {
            var sha1 = System.Security.Cryptography.SHA256.Create();
            var inputBytes = System.Text.Encoding.ASCII.GetBytes(value);
            var hash = sha1.ComputeHash(inputBytes);

            var sb = new System.Text.StringBuilder();
            for (var i = 0; i < hash.Length; i++)
            {
                sb.Append(hash[i].ToString("X2"));
            }
            return sb.ToString();
        }
    }

    [EnableCors("*", "*", "*")]
    public class RolesController : ApiController
    {
        [HttpPatch]
        public RoleModel GetRoles()
        {
            var roleModel = new RoleModel();
            try
            {
                using (WebStatsContext db = new WebStatsContext())
                {
                    roleModel.RoleNames = db.Roles.Select(r => r.RoleName).ToList();
                    roleModel.Success = "ok";
                }
            }
            catch (Exception ex) { roleModel.Success = Helpers.ErrorDetails(ex); }
            return roleModel;
        }

        [HttpGet]
        public RoleModel GetUserRoles(string userName, string whichType)
        {
            RoleModel roleModel = new RoleModel();
            try
            {
                using (WebStatsContext db = new WebStatsContext())
                {
                    if(whichType== "Assigned")
                        roleModel.RoleNames = db.UserRoles.Where(ur => ur.UserName == userName).Select(ur => ur.RoleName).ToList();

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
            catch (Exception ex) { roleModel.Success = Helpers.ErrorDetails(ex); }
            return roleModel;
        }

        [HttpPost]
        public string AddRole(string roleName)
        {
            string success = "";
            try
            {
                using (WebStatsContext db = new WebStatsContext())
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
                using (WebStatsContext db = new WebStatsContext())
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
                using (WebStatsContext db = new WebStatsContext())
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
        public string RemoveUserRole(string userName, string roleName) {
            string success = "";
            try
            {
                using (WebStatsContext db = new WebStatsContext())
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


    public class UsersModel
    {
        public UsersModel()
        {
            UserNames = new List<string>();
        }
        public List<string> UserNames { get; set; }
        public string Success { get; set; }
    }

    public class RoleModel
    {
        public RoleModel()
        {
            RoleNames = new List<string>();
        }
        public List<string> RoleNames { get; set; }
        public string Success { get; set; }
    }

    public class UserRoleModel
    {
        public string UserName { get; set; }
        public string RoleName { get; set; }
    }

}
