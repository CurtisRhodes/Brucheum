﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Models;
using WebApi.MySqDataContext;

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
                using (OggleBoobleMySqContext db = new OggleBoobleMySqContext())
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
            using (OggleBoobleMySqContext db = new OggleBoobleMySqContext())
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
        public List<string> UserPermissions(string userName)
        {
            List<string> roles = null;
            using (OggleBoobleMySqContext db = new OggleBoobleMySqContext())
            {
                roles = db.UserRoles.Where(r => r.UserName == userName).Select(r => r.RoleName).ToList();
            }
            return roles;
        }

        [HttpPost]
        public string RegisterUser(RegisteredUser registeredUserModel)
        {
            string success = "";
            try
            {
                using (OggleBoobleMySqContext db = new OggleBoobleMySqContext())
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
