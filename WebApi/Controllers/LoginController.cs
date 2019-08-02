﻿using System;
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
                         join r in db.Roles on u.RoleId equals r.RoleId
                         where u.UserName == userName
                         select new UserRoleModel()
                         {
                             UserName = userName,
                             RoleId = u.RoleId,
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
                        registeredUserModel.IpAddress = Helpers.GetIPAddress();
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

    public class UserRoleModel {
        public string UserName { get; set; }
        public string RoleId { get; set; }
        public string RoleName { get; set; }
    }

}