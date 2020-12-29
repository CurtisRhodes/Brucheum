using Newtonsoft.Json;
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
        public SuccessModel VerifyLogin(string userName, string passWord)
        {
            SuccessModel successModel = new SuccessModel();
            using (var db = new OggleBoobleMySqlContext())
            {
                string encryptedPassword = HashSHA256(passWord);
                RegisteredUser dbRegisteredUser = db.RegisteredUsers.Where(u => u.UserName == userName && u.Pswrd == encryptedPassword).FirstOrDefault();
                if (dbRegisteredUser != null)
                {
                    successModel.ReturnValue = dbRegisteredUser.VisitorId;
                    successModel.Success = "ok";
                }
                else
                {
                    dbRegisteredUser = db.RegisteredUsers.Where(u => u.UserName == userName).FirstOrDefault();
                    if (dbRegisteredUser == null)
                    {
                        successModel.ReturnValue = "valid";
                        successModel.Success = "user name not found";
                    }
                    else
                    {
                        successModel.ReturnValue = "valid";
                        successModel.Success = "password fail";
                    }
                }
            }
            return successModel;
        }

        [HttpPost]
        [Route("api/Login/RegisterUser")]
        public string AddUser(RegisteredUserModel registeredUserModel)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    RegisteredUser dbUserName = db.RegisteredUsers.Where(u => u.UserName == registeredUserModel.UserName).FirstOrDefault();
                    if (dbUserName != null)
                    {
                        return "user name already exists";
                    }
                    //string visitorId = registeredUserModel.VisitorId;
                    RegisteredUser dbUserVisitorId = db.RegisteredUsers.Where(u => u.VisitorId == registeredUserModel.VisitorId).FirstOrDefault();
                    if (dbUserVisitorId != null)
                    {
                        return "visitorId already registered";
                    }
                    RegisteredUser dbNewUser = new RegisteredUser()
                    {
                        VisitorId = registeredUserModel.VisitorId,
                        Pswrd = HashSHA256(registeredUserModel.ClearPassword),
                        UserName = registeredUserModel.UserName,
                        FirstName = registeredUserModel.FirstName,
                        LastName = registeredUserModel.LastName,
                        Status = registeredUserModel.Status,
                        UserRole = registeredUserModel.UserRole,
                        Email = registeredUserModel.Email,
                        UserSettings = registeredUserModel.UserSettings,
                        UserCredits = registeredUserModel.UserCredits,
                        Created = DateTime.Now
                    };
                    db.RegisteredUsers.Add(dbNewUser);
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpGet]
        [Route("api/Login/GetUserInfo")]
        public RegisteredUserModel GetUserInfo(string visitorId)
        {
            var registeredUser = new RegisteredUserModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbRegisteredUser = db.RegisteredUsers.Where(u => u.VisitorId == visitorId).FirstOrDefault();
                    if (dbRegisteredUser == null)
                        registeredUser.Success = "not registered";
                    else
                    {
                        registeredUser.VisitorId = dbRegisteredUser.VisitorId;
                        registeredUser.UserName = dbRegisteredUser.UserName;
                        registeredUser.FirstName = dbRegisteredUser.FirstName;
                        registeredUser.LastName = dbRegisteredUser.LastName;
                        registeredUser.UserRole = dbRegisteredUser.UserRole;
                        registeredUser.Status = dbRegisteredUser.Status;
                        registeredUser.UserSettings = dbRegisteredUser.UserSettings;
                        registeredUser.Email = dbRegisteredUser.Email;
                        registeredUser.Created = dbRegisteredUser.Created;
                        registeredUser.Success = "ok";
                    }
                }
            }
            catch (Exception ex)
            {
                registeredUser.Success = Helpers.ErrorDetails(ex);
            }
            return registeredUser;
        }

        [HttpPut]
        [Route("api/OggleUser/UpdateUser")]
        public string UpdateUser(RegisteredUserModel userInfo)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbUser = db.RegisteredUsers.Where(u => u.VisitorId == userInfo.VisitorId).FirstOrDefault();
                    if (dbUser == null)
                        success= "not found";
                    else
                    {
                        dbUser.UserName = userInfo.UserName;
                        dbUser.LastName = userInfo.LastName;
                        dbUser.FirstName = userInfo.FirstName;
                        dbUser.Status = userInfo.Status;
                        dbUser.UserSettings = userInfo.UserSettings;
                        dbUser.UserRole = userInfo.UserRole;
                        dbUser.UserCredits = userInfo.UserCredits;
                        dbUser.Email = userInfo.Email;
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
    public class UserCreditsController : ApiController
    {
        [HttpPost]
        [Route("api/User/AwardCredits")]
        public string AwardCredits(UserCredit userCredit)
        {
            string success;
            try
            {
                userCredit.Occured = DateTime.Now;
                using (var db = new OggleBoobleMySqlContext())
                {
                    //UserCredit existingVisitor = db.UserCredits.Where(cr => cr.VisitorId == userCredit.VisitorId).FirstOrDefault();
                    //if (existingVisitor == null)
                    //{}

                    db.UserCredits.Add(userCredit);

                    //var dbUser = db.RegisteredUsers.Where(r => r.VisitorId == userCredit.VisitorId).FirstOrDefault();
                    //if (dbUser != null) {
                    //    dbUser.UserCredits = db.UserCredits.Where(c => c.VisitorId == userCredit.VisitorId).Sum(c => c.Credits);
                    //}
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpGet]
        [Route("api/Login/GetUserCredits")]
        public SuccessModel GetUserCredits(string visitorId)
        {
            var successModel = new SuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    int totalCredits = db.UserCredits.Where(c => c.VisitorId == visitorId).Sum(c => c.Credits);
                    successModel.ReturnValue = totalCredits.ToString();
                    successModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                successModel.Success = Helpers.ErrorDetails(ex);
            }
            return successModel;
        }
    }
}