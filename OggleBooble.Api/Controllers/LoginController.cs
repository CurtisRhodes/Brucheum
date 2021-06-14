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
                        dbRegisteredUser.IsLoggedIn = true;
                        db.SaveChanges();

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
        public AddRegisterdUserSuccessModel AddRegisterUser(RegisteredUser newRegisteredUserModel)
        {
            var registerdUserSuccessModel = new AddRegisterdUserSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    registerdUserSuccessModel.RegisterStatus = "user successfully registered";
                    var dbRegisteredUserUserName = db.RegisteredUsers.Where(u => u.UserName == newRegisteredUserModel.UserName).FirstOrDefault();
                    if (dbRegisteredUserUserName != null)
                    {
                        registerdUserSuccessModel.RegisterStatus = "user name already exists";
                        registerdUserSuccessModel.NewVisitorId = newRegisteredUserModel.VisitorId;
                        registerdUserSuccessModel.Success = "ok";
                        return registerdUserSuccessModel;
                    }

                    // check for troubled visitorId
                    if ((newRegisteredUserModel.VisitorId == null) ||
                        (newRegisteredUserModel.VisitorId.IndexOf("cookie not found") > -1) ||
                        (newRegisteredUserModel.VisitorId.IndexOf("user does not accept cookies") > -1) ||
                        (newRegisteredUserModel.VisitorId=="boogers") ||
                        (newRegisteredUserModel.VisitorId == "unknown"))
                    { 
                        newRegisteredUserModel.VisitorId = Guid.NewGuid().ToString();
                        Visitor newVisitor = new Visitor()
                        {
                            VisitorId = newRegisteredUserModel.VisitorId,
                            IpAddress = "00.00.00",
                            City = "unknown",
                            Region = "register",
                            Country = "ZZ",
                            GeoCode = "unknown",
                            InitialPage = 0
                        };
                        db.Visitors.Add(newVisitor);
                        db.SaveChanges();
                        registerdUserSuccessModel.NewVisitorId = newRegisteredUserModel.VisitorId;
                        registerdUserSuccessModel.RegisterStatus = "new VisitorId created";
                    }
                    else {
                        Visitor visitor = db.Visitors.Where(v => v.VisitorId == newRegisteredUserModel.VisitorId).FirstOrDefault();
                        if (visitor == null) {
                            registerdUserSuccessModel.RegisterStatus = "VisitorId not found";
                            registerdUserSuccessModel.NewVisitorId = newRegisteredUserModel.VisitorId;
                            registerdUserSuccessModel.Success = "ok";
                            return registerdUserSuccessModel;
                        }
                    }

                    RegisteredUser dbUserVisitorId = db.RegisteredUsers.Where(u => u.VisitorId == newRegisteredUserModel.VisitorId).FirstOrDefault();
                    if (dbUserVisitorId != null)
                    {
                        if (dbUserVisitorId.UserRole == "admin")
                        {
                            registerdUserSuccessModel.RegisterStatus = "admin override";
                            newRegisteredUserModel.VisitorId = Guid.NewGuid().ToString();
                            registerdUserSuccessModel.NewVisitorId = newRegisteredUserModel.VisitorId;
                        }
                        else
                        {
                            registerdUserSuccessModel.RegisterStatus = "visitorId already registered";
                            registerdUserSuccessModel.NewVisitorId = newRegisteredUserModel.VisitorId;
                            registerdUserSuccessModel.Success = "ok";
                            return registerdUserSuccessModel;
                        }
                    }
                    var newRegisteredUser = new RegisteredUser()
                    {
                        VisitorId= newRegisteredUserModel.VisitorId,
                        UserName = newRegisteredUserModel.UserName,
                        UserRole = newRegisteredUserModel.UserRole,
                        UserCredits = newRegisteredUserModel.UserCredits,
                        Status = newRegisteredUserModel.Status,
                        IsLoggedIn = true,
                        Email = newRegisteredUserModel.Email,
                        FirstName = newRegisteredUserModel.FirstName,
                        LastName = newRegisteredUserModel.LastName,
                        Created = DateTime.Now,
                        Pswrd = HashSHA256(newRegisteredUserModel.Pswrd)
                    };

                    db.RegisteredUsers.Add(newRegisteredUser);
                    db.SaveChanges();
                    registerdUserSuccessModel.Success = "ok";
                }
            }
            catch (Exception ex) { registerdUserSuccessModel.Success = Helpers.ErrorDetails(ex); }
            return registerdUserSuccessModel;
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