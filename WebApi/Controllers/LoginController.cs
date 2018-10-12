using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Results;

namespace Service1.Controllers
{
    [EnableCors("*", "*", "*")]
    public class LoginController : ApiController
    {
        public static string HashSHA256(string value)
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
        public string Login(string userName, string password)
        {
            string userId = "ERROR: unknown";
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    password = HashSHA256(password);
                    var registeredUser = db.UserLogins.Where(l => (l.UserName == userName) && (l.PasswordHash == password)).FirstOrDefault();
                    if (registeredUser == null)
                    {
                        registeredUser = db.UserLogins.Where(l => (l.UserName == userName)).FirstOrDefault();
                        if (registeredUser == null)
                            userId = "User Name not recognized";
                        else
                            userId = "Password Incorrect";
                    }
                    else
                        userId = registeredUser.UserId.ToString();
                }
            }
            catch (Exception e)
            {
                userId = "ERROR: " + e.Message;
            }
            return userId;
        }

        [HttpGet]
        public string GetFacebookUserId(string name, string facebookId)
        {
            string response = "ERROR: unknown";
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    var userLogin = db.UserLogins.Where(l => l.FirstName == facebookId).FirstOrDefault();

                    if (userLogin == null)
                    {
                        var login = new UserLogin();
                        login.UserId = Guid.NewGuid();
                        login.UserName = name;
                        login.CreateDate = DateTime.Now;
                        login.FaceBookId = facebookId;
                        db.UserLogins.Add(login);
                        db.SaveChanges();
                        response = login.UserId.ToString();
                    }
                    else
                        response = userLogin.UserId.ToString();
                }
            }
            catch (Exception ex)
            {
                response = "ERROR: " + ex.Message;
            }
            return response;
        }


        [HttpPost]
        public JsonResult<UserLoginModel> AddorGetUser(UserLoginModel upUser)
        {
            upUser.success = "on no";
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {

                    var registeredUser = db.UserLogins.Where(l => (l.UserId == upUser.UserId)).FirstOrDefault();
                    if (registeredUser == null)
                    {
                          //{ 00000000 - 0000 - 0000 - 0000 - 000000000000}


                        var login = new UserLogin();
                        login.UserId = Guid.NewGuid();
                        login.UserName = upUser.UserName;
                        login.PasswordHash = HashSHA256(upUser.PasswordHash);
                        login.CreateDate = DateTime.Now;
                        login.PhoneNumber = upUser.PhoneNumber;
                        login.Email = upUser.Email;
                        login.FirstName = upUser.FirstName;
                        login.LastName = upUser.PhoneNumber;
                        login.FaceBookId = upUser.FaceBookId;

                        db.UserLogins.Add(login);
                        db.SaveChanges();
                        upUser.UserId = login.UserId;
                    }
                    else
                    {
                        upUser.UserName = registeredUser.UserName;
                        upUser.FirstName = registeredUser.FirstName;
                        upUser.LastName = registeredUser.LastName;
                        upUser.Email = registeredUser.Email;
                        upUser.PhoneNumber = registeredUser.PhoneNumber;
                        upUser.Pin = registeredUser.Pin;
                    }
                    upUser.success = "ok";
                }
            }
            catch (Exception ex)
            {
                upUser.success = "ERROR: " + ex.Message;
            }
            return Json(upUser);
        }

        [HttpPut]
        public string UpdateUser(UserLoginModel login)
        {
            string success = "on no";
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    var user = db.UserLogins.Where(l => l.UserId == login.UserId).FirstOrDefault();
                    if (user != null)
                    {
                        user.UserName = login.UserName;
                        user.LastModified= DateTime.Now;
                        user.Email = login.Email;
                        user.FirstName = login.FirstName;
                        user.LastName = login.LastName;
                        user.PhoneNumber = login.PhoneNumber;
                        user.Pin = login.Pin;

                        db.SaveChanges();
                        success = "ok";
                    }
                    else
                        success = "User Not Found";
                }
            }
            catch (Exception ex)
            {
                success = ex.Message;
            }
            return success;
        }


    }
}
 