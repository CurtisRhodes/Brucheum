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
        public RegisteredUsersSuccessModel VerifyLogin(string userName, string passWord)
        {
            var registeredUserSuccess = new RegisteredUsersSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    string encryptedPassword = HashSHA256(passWord);
                    RegisteredUser dbRegisteredUser = db.RegisteredUsers.Where(u => u.UserName == userName && u.Pswrd == encryptedPassword).FirstOrDefault();
                    if (dbRegisteredUser != null)
                    {
                        registeredUserSuccess.UserInfo.IsLoggedIn = dbRegisteredUser.IsLoggedIn;
                        registeredUserSuccess.UserInfo.VisitorId = dbRegisteredUser.VisitorId;
                        registeredUserSuccess.UserInfo.UserName = dbRegisteredUser.UserName;
                        registeredUserSuccess.UserInfo.UserRole = dbRegisteredUser.UserRole;
                        registeredUserSuccess.Success = "ok";
                    }
                    else
                    {
                        dbRegisteredUser = db.RegisteredUsers.Where(u => u.UserName == userName).FirstOrDefault();
                        if (dbRegisteredUser == null)
                        {
                            registeredUserSuccess.Success = "user name not found";
                        }
                        else
                        {
                            registeredUserSuccess.Success = "password fail";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                registeredUserSuccess.Success = Helpers.ErrorDetails(ex);
            }
            return registeredUserSuccess;
        }

        [HttpPost]
        [Route("api/Login/RegisterUser")]
        public string AddRegisterUser(RegisteredUser newUser)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    RegisteredUser dbUserName = db.RegisteredUsers.Where(u => u.UserName == newUser.UserName).FirstOrDefault();
                    if (dbUserName != null)
                    {
                        return "user name already exists";
                    }
                    RegisteredUser dbUserVisitorId = db.RegisteredUsers.Where(u => u.VisitorId == newUser.VisitorId).FirstOrDefault();
                    if (dbUserVisitorId != null)
                    {
                        return "visitorId already registered";
                    }

                    newUser.Created = DateTime.Now;
                    newUser.IsLoggedIn = true;                  
                    db.RegisteredUsers.Add(newUser);
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpGet]
        [Route("api/Login/GetUserInfo")]
        public RegisteredUsersSuccessModel GetUserInfo(string visitorId)
        {
            var registeredUser = new RegisteredUsersSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbRegisteredUser = db.RegisteredUsers.Where(u => u.VisitorId == visitorId).FirstOrDefault();
                    if (dbRegisteredUser == null)
                        registeredUser.Success = "not registered";
                    else
                    {
                        registeredUser.UserInfo = dbRegisteredUser;
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
        [Route("api/Login/UpdateUser")]
        public string UpdateUser(RegisteredUser userInfo)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbRegisteredUser = db.RegisteredUsers.Where(u => u.VisitorId == userInfo.VisitorId).FirstOrDefault();
                    if (dbRegisteredUser == null)
                        success = "not found";
                    else
                    {
                        dbRegisteredUser = userInfo;
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

        [HttpPut]
        [Route("api/Login/UpdateUser")]
        public string UpdateIsLoggedIn(string visitorId, bool isLoggedIn)
        {
            //url: settingsArray.ApiServer + "api/Login/UpdateIsLoggedIn?visitorId=" + visitorId + "&isLoggedIn=" + isLoggedIn,
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbRegisteredUser = db.RegisteredUsers.Where(u => u.VisitorId == visitorId).FirstOrDefault();
                    if (dbRegisteredUser == null)
                        success = "user not found";
                    else
                    {
                        dbRegisteredUser.IsLoggedIn = isLoggedIn;
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