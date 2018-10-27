﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Results;
using WebApi.Models;

namespace WebApi
{


    [EnableCors("*", "*", "*")]
    public class LoginController : ApiController
    {
        [HttpGet]
        public string Login(string userName, string password)
        {
            string userId = "ERROR: unknown";
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    password = HashSHA256(password);
                    var registeredUser = db.SiteUsers.Where(l => (l.DisplayName == userName) && (l.PasswordHash == password)).FirstOrDefault();
                    if (registeredUser == null)
                    {
                        registeredUser = db.SiteUsers.Where(l => (l.DisplayName == userName)).FirstOrDefault();
                        if (registeredUser == null)
                            userId = "User Name not recognized";
                        else
                            userId = "Password Incorrect";
                    }
                    else
                        userId = registeredUser.Email.ToString();
                }
            }
            catch (Exception e)
            {
                userId = "ERROR: " + e.Message;
            }
            return userId;
        }

        [HttpGet]
        public JsonResult<SiteUser> GetUser(string userId)
        {
            var user = new SiteUser();
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    //var registeredUser = db.UserLogins.Where(l => (l.UserId.ToString() == userId)).FirstOrDefault();
                    //if (registeredUser != null)
                    //{
                    //    user.DisplayName = registeredUser.UserName;
                    //    user.FirstName = registeredUser.FirstName;
                    //    user.LastName = registeredUser.LastName;
                    //    user.Email = registeredUser.Email;
                    //    user.PhoneNumber = registeredUser.PhoneNumber;
                    //    user.Pin = registeredUser.Pin;
                    //}
                    //user.success = "ok";
                }
            }
            catch (Exception ex)
            {
                user.DisplayName = "ERROR: " + ex.Message;
            }
            return Json(user);
        }

        [HttpPut]
        public string UpdateUser(SiteUser login)
        {
            string success = "on no";
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    //var user = db.UserLogins.Where(l => l.UserId == login.UserId).FirstOrDefault();
                    //if (user != null)
                    //{
                    //    user.UserName = login.UserName;
                    //    user.LastModified = DateTime.Now;
                    //    user.Email = login.Email;
                    //    user.FirstName = login.FirstName;
                    //    user.LastName = login.LastName;
                    //    user.PhoneNumber = login.PhoneNumber;
                    //    user.Pin = login.Pin;

                    //    db.SaveChanges();
                    //    success = "ok";
                    //}
                    //else
                    //    success = "User Not Found";
                }
            }
            catch (Exception ex)
            {
                success = ex.Message;
            }
            return success;
        }

        [HttpPost]
        public JsonResult<UserLoginResponse> Register(SiteUser login)
        {
            var rtn = new UserLoginResponse() { success = "ERROR: ono" };
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    //var newUser = new UserLogin();
                    //newUser.UserId = Guid.NewGuid();
                    //newUser.UserName = login.UserName;
                    //newUser.PasswordHash = HashSHA256(login.PasswordHash);
                    //newUser.CreateDate = DateTime.Now;
                    //newUser.Email = login.Email;
                    //newUser.FirstName = login.FirstName;
                    //newUser.LastName = login.LastName;
                    //newUser.PhoneNumber = login.PhoneNumber;
                    //newUser.Pin = login.Pin;

                    //db.UserLogins.Add(newUser);
                    //db.SaveChanges();
                    //rtn.UserId = newUser.UserId;
                    //rtn.UserName = newUser.UserName;
                    rtn.success = "ok";
                }
            }
            catch (Exception ex)
            {
                rtn.success = "ERROR: " + ex.Message;
            }
            return Json(rtn);
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
                using (GoDaddyContext db = new GoDaddyContext())
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

    [EnableCors("*", "*", "*")]
    public class UserRoleController : ApiController
    {
        //[HttpPost]
        //public string AddUserRole(AspNetUserRole userRoleModelContainingUserName)
        //{
        //    string success = "";
        //    try
        //    {
        //        using (GoDaddyContext db = new GoDaddyContext())
        //        {
        //            //foreach(AspNetUserRole netUserRole in userRoleModelsContainingUserName)
        //            string roleId = db.AspNetRoles.Where(r => r.Name == userRoleModelContainingUserName.RoleId).First().Id;

        //            var newUserRole = new AspNetUserRole();
        //            newUserRole.RoleId = roleId;
        //            newUserRole.UserId = userRoleModelContainingUserName.UserId;
        //            db.AspNetUserRoles.Add(newUserRole);
        //            db.SaveChanges();
        //            success = "ok";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        success = ex.Message;
        //    }
        //    return success;
        //}

    }
}