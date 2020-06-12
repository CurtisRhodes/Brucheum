using OggleBooble.Api.Models;
using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class OggleUserController : ApiController
    {
        [HttpGet]
        [Route("api/Login/VerifyLogin")]
        public string VerifyLogin(string userName, string passWord)
        {
            string success = "";
            using (var db = new OggleBoobleMySqlContext())
            {
                string encryptedPassword = HashSHA256(passWord);
                RegisteredUser dbRegisteredUser = db.RegisteredUsers.Where(u => u.UserName == userName && u.Pswrd == encryptedPassword).FirstOrDefault();
                if (dbRegisteredUser != null)
                {
                    //--record Login
                    success = "ok";
                }
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
        [Route("api/Login/UserPermissions")]
        public List<string> UserPermissions(string userName)
        {
            List<string> roles = null;
            using (var db = new OggleBoobleMySqlContext())
            {
                roles = db.UserRoles.Where(r => r.UserName == userName).Select(r => r.RoleName).ToList();
            }
            return roles;
        }

        [HttpPost]
        [Route("api/Login/AddUser")]
        public string AddUser(RegisteredUser registeredUserModel)
        {
            string success = "";
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    RegisteredUser dbRegisteredUser = db.RegisteredUsers.Where(u => u.UserName == registeredUserModel.UserName).FirstOrDefault();
                    if (dbRegisteredUser != null)
                        success = "user name already exists";
                    else
                    {
                        registeredUserModel.Pswrd = HashSHA256(registeredUserModel.Pswrd);
                        registeredUserModel.Created = DateTime.Now;
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

        [HttpGet]
        [Route("api/Login/GetUserInfo")]
        public RegisteredUser GetUserInfo(string visitorId)
        {
            var registeredUser = new RegisteredUser();
            using (var db = new OggleBoobleMySqlContext())
            {
                registeredUser = db.RegisteredUsers.Where(u => u.VisitorId == visitorId).FirstOrDefault();
            }
            return registeredUser;
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
}