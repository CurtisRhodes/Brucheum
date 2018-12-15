using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Results;
using WebApi.DataContext;
using WebApi.Models;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class xUserController : ApiController
    {

        [HttpGet]
        public IList<KeyValuePair> GetUsers()
        {
            var list = new List<KeyValuePair>();
            try
            {
                using (AspNetContext db = new AspNetContext())
                {
                    var users = db.AspNetUsers.ToList();
                    foreach (AspNetUser user in users)
                    {
                        list.Add(new KeyValuePair() { Key = user.Id.ToString(), Value = user.UserName });
                    }
                }
            }
            catch (Exception ex)
            {
                list.Add(new KeyValuePair() {Key="0", Value = ex.Message });
            }
            return list;
        }

        [HttpGet]
        public string VerifyLogin(string userName, string password)
        {
            string error = "ERROR: unknown";
            try
            {
                using (AspNetContext db = new AspNetContext())
                {
                    password = HashSHA256(password);
                    //var registeredUser = db.SiteUsers.Where(l => (l.DisplayName == userName) && (l.PasswordHash == password)).FirstOrDefault();
                    var registeredUser = db.AspNetUsers.Where(u => (u.UserName == userName) && (u.PasswordHash == password)).FirstOrDefault();
                    if (registeredUser == null)
                    {
                        registeredUser = db.AspNetUsers.Where(u => (u.UserName == userName)).FirstOrDefault();
                        if (registeredUser == null)
                            error = "User Name not recognized";
                        else
                            error = "Password Incorrect";
                    }
                    else
                        error = "found";
                }
            }
            catch (Exception ex)
            {
                error = Helpers.ErrorDetails(ex);
            }
            return error;
        }

        [HttpGet]
        public JsonResult<AspNetUser> GetUser(string userId)
        {
            AspNetUser user = new AspNetUser();
            try
            {
                using (AspNetContext db = new AspNetContext())
                {
                    user = db.AspNetUsers.Where(u => u.Id == userId).FirstOrDefault();
                }
            }
            catch (Exception ex)
            {
                user.Id = Helpers.ErrorDetails(ex);
            }
            return Json(user);
        }

        [HttpPut]
        public string Update(AspNetUser model)
        {
            string success = "";
            try
            {
                using (AspNetContext db = new AspNetContext())
                {
                    AspNetUser user = db.AspNetUsers.Where(u => u.Id == model.Id).FirstOrDefault();
                    if (user != null)
                    {
                        user.UserName = model.UserName;
                        user.Email = model.Email;
                        user.PhoneNumber = model.PhoneNumber;
                        //user.FirstName = model.FirstName;
                        //user.LastName = model.LastName;
                        //user.Pin = model.Pin;
                        //user.LastModified = DateTime.Now;

                        db.SaveChanges();
                        success = "ok";
                    }
                    else
                        success = "User Not Found";
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

        [HttpGet]
        public string GetFacebookUserId(string name, string facebookId)
        {
            string response = "ERROR: unknown";
            try
            {
                using (AspNetContext db = new AspNetContext())
                {
                    //var userLogin = db.UserLogins.Where(l => l.FirstName == facebookId).FirstOrDefault();

                    //if (userLogin == null)
                    //{
                    //    var login = new UserLogin();
                    //    login.UserId = Guid.NewGuid();
                    //    login.UserName = name;
                    //    login.CreateDate = DateTime.Now;
                    //    login.FaceBookId = facebookId;
                    //    db.UserLogins.Add(login);
                    //    db.SaveChanges();
                    //    response = login.UserId.ToString();
                    //}
                    //else
                    //    response = userLogin.UserId.ToString();
                }
            }
            catch (Exception ex)
            {
                response = "ERROR: " + ex.Message;
            }
            return response;
        }
    }

    //[EnableCors("*", "*", "*")]
    //public class UserController : ApiController
    //{
    //    //[HttpGet]
    //    //public string AddUserRole(AspNetUserRole userRoleModelContainingUserName)
    //    //{
    //    //    string success = "";
    //    //    try
    //    //    {
    //    //        using (GoDaddyContext db = new GoDaddyContext())
    //    //        {
    //    //            //foreach(AspNetUserRole netUserRole in userRoleModelsContainingUserName)
    //    //            string roleId = db.AspNetRoles.Where(r => r.Name == userRoleModelContainingUserName.RoleId).First().Id;
    //    //            var newUserRole = new AspNetUserRole();
    //    //            newUserRole.RoleId = roleId;
    //    //            newUserRole.UserId = userRoleModelContainingUserName.UserId;
    //    //            db.AspNetUserRoles.Add(newUserRole);
    //    //            db.SaveChanges();
    //    //            success = "ok";
    //    //        }
    //    //    }
    //    //    catch (Exception ex)
    //    //    {
    //    //        success = ex.Message;
    //    //    }
    //    //    return success;
    //    //}
    //}

    [EnableCors("*", "*", "*")]
    public class xRoleController : ApiController
    {
        //select id from asp.AspNetRoles where Name = 'Admin'
        [HttpGet]
        public string GetRoleId(string roleName)
        {
            string roleId = "";
            try
            {
                using (AspNetContext db = new AspNetContext())
                {
                    roleId = db.AspNetRoles.Where(r => r.Name == roleName).Select(r => r.Id).FirstOrDefault();
                }
            }
            catch (Exception ex) { roleId = "Error: " + Helpers.ErrorDetails(ex);  }
            return roleId;
        }



        [HttpPost]
        public string AddRole(string roleName)
        {
            string success = "";
            try
            {
                using (AspNetContext db = new AspNetContext())
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
        public IList<KeyValuePair> Get()
        {   // finally a day later I figured out that because the generated model AspNetRole has foreign key notations which were causing this to fail
            var list = new List<KeyValuePair>();
            try
            {
                using (AspNetContext db = new AspNetContext())
                {
                    var roles = db.AspNetRoles.ToList();
                    foreach (AspNetRole r in roles)
                    {
                        list.Add(new KeyValuePair() { Key = r.Id, Value = r.Name });
                    }
                }
            }
            catch (Exception ex) { list.Add(new KeyValuePair() { Key = "0", Value = Helpers.ErrorDetails(ex) }); }
            return list;
        }

        [HttpPut]
        public string Put(KeyValuePair roleModel)
        {
            string success = "ono";
            try
            {
                using (AspNetContext db = new AspNetContext())
                {
                    AspNetRole @role = db.AspNetRoles.Where(r => r.Id == roleModel.Key).First();
                    @role.Name = roleModel.Value;
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = ex.Message; }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class xUserRoleController : ApiController
    {
        [HttpPost]
        public string AddUserRole(AspNetUserRole userRole)
        {
            string success = "";
            try
            {
                using (AspNetContext db = new AspNetContext())
                {
                    var newUserRole = new AspNetUserRole();
                    newUserRole.RoleId = userRole.RoleId;
                    newUserRole.UserId = userRole.UserId;
                    db.AspNetUserRoles.Add(newUserRole);
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

    }
}