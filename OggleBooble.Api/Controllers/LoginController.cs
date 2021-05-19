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
    public class LoginController : ApiController
    {
        [HttpGet]
        [Route("api/Login/VerifyLogin")]
        public VerifyLoginSuccessModel VerifyLogin(string userName, string passWord)
        {
            var verifyRegisteredUserSuccess = new VerifyLoginSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    string encryptedPassword = HashSHA256(passWord);
                    RegisteredUser dbRegisteredUser = db.RegisteredUsers.Where(u => u.UserName == userName && u.Pswrd == encryptedPassword).FirstOrDefault();
                    if (dbRegisteredUser != null)
                    {
                        verifyRegisteredUserSuccess.VisitorId = dbRegisteredUser.VisitorId;
                        verifyRegisteredUserSuccess.UserName = dbRegisteredUser.UserName;
                        verifyRegisteredUserSuccess.UserRole = dbRegisteredUser.UserRole;
                        verifyRegisteredUserSuccess.Success = "ok";
                    }
                    else
                    {
                        dbRegisteredUser = db.RegisteredUsers.Where(u => u.UserName == userName).FirstOrDefault();
                        if (dbRegisteredUser == null)
                        {
                            verifyRegisteredUserSuccess.Success = "user name not found";
                        }
                        else
                        {
                            verifyRegisteredUserSuccess.Success = "password fail";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                verifyRegisteredUserSuccess.Success = Helpers.ErrorDetails(ex);
            }
            return verifyRegisteredUserSuccess;
        }

        [HttpPost]
        [Route("api/Login/AddRegisterUser")]
        public AddRegisteredUserSuccessModel AddRegisterUser(RegisteredUser newRegisteredUser)
        {
            var addRegisteredUserSuccess = new AddRegisteredUserSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    RegisteredUser dbUserName = db.RegisteredUsers.Where(u => u.UserName == newRegisteredUser.UserName).FirstOrDefault();
                    if (dbUserName != null)
                    {
                        addRegisteredUserSuccess.Success = "user name already exists";
                        return addRegisteredUserSuccess;
                    }
                    RegisteredUser dbUserVisitorId = db.RegisteredUsers.Where(u => u.VisitorId == newRegisteredUser.VisitorId).FirstOrDefault();
                    if (dbUserVisitorId != null)
                    {
                        if (dbUserVisitorId.UserRole == "admin")
                        {
                            newRegisteredUser.VisitorId = Guid.NewGuid().ToString();
                            addRegisteredUserSuccess.NewVisitorId = newRegisteredUser.VisitorId;
                        }
                        else
                        {
                            addRegisteredUserSuccess.Success = "visitorId already registered";
                            return addRegisteredUserSuccess;
                        }
                    }
                    newRegisteredUser.Created = DateTime.Now;
                    newRegisteredUser.Pswrd = HashSHA256(newRegisteredUser.Pswrd);
                    db.RegisteredUsers.Add(newRegisteredUser);
                    db.SaveChanges();
                    addRegisteredUserSuccess.Success = "ok";
                }
            }
            catch (Exception ex) { addRegisteredUserSuccess.Success = Helpers.ErrorDetails(ex); }
            return addRegisteredUserSuccess;
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
                        dbRegisteredUser.IsLoggedIn = userInfo.IsLoggedIn;
                        if (userInfo.UserCredits > 0)
                            dbRegisteredUser.UserCredits = userInfo.UserCredits;
                        if (userInfo.UserName != null)
                            dbRegisteredUser.UserName = userInfo.UserName;
                        if (userInfo.FirstName != null)
                            dbRegisteredUser.FirstName = userInfo.FirstName;
                        if (userInfo.LastName != null)
                            dbRegisteredUser.LastName = userInfo.LastName;
                        if (userInfo.Status != null)
                            dbRegisteredUser.Status = userInfo.Status;
                        if (userInfo.UserRole != null)
                            dbRegisteredUser.UserRole = userInfo.UserRole;
                        if (userInfo.Email != null)
                            dbRegisteredUser.Email = userInfo.Email;
                        if (userInfo.UserSettings != null)
                            dbRegisteredUser.UserSettings = userInfo.UserSettings;
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