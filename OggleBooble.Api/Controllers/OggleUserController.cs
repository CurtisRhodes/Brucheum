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
                    db.UserCredits.Add(userCredit);
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
        [Route("api/OggleUser/GetUserSettings")]
        public SuccessModel GetUserSettings(string visitorId)
        {
            var successModel = new SuccessModel();
            try
            {
                using (var mdb = new OggleBoobleMySqlContext())
                {
                    var dbRegisteredUsers = mdb.RegisteredUsers.Where(u => u.VisitorId == visitorId).FirstOrDefault();
                    if (dbRegisteredUsers != null) 
                    {
                        successModel.ReturnValue = dbRegisteredUsers.UserSettings;
                    }
                }
                successModel.Success = "ok";
            }
            catch (Exception ex)
            {
                successModel.Success = Helpers.ErrorDetails(ex);
            }
            return successModel;
        }

        [HttpPut]
        [Route("api/OggleUser/UpdateUserSettings")]
        public SuccessModel UpdateUserSettings(string visitorId, string settingName, string settingJson)
        {
            var successModel = new SuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbUser = db.RegisteredUsers.Where(u => u.VisitorId == visitorId).FirstOrDefault();
                    if (dbUser != null)
                    {
                        string json = JsonConvert.SerializeObject(settingJson);
                        if (settingName == "Initial")
                        {
                            //var x = JsonConvert.DeserializeObject(dbUser.UserSettings);
                            dbUser.UserSettings = JsonConvert.SerializeObject(settingJson);
                            //dbUser.UserSettings = JsonConvert.DeserializeObject(settingJson).ToString();
                            dbUser.UserSettings = settingJson;
                            db.SaveChanges();
                            successModel.Success = "ok";
                        }
                        else {
                            string userSettingsRaw = dbUser.UserSettings;
                            //var userSettingsParse = JsonConvert.DeserializeObject(dbUser.UserSettings);
                            //var test1 = userSettingsParse
                        
                        }


                        // replace section
                        //var dbUser = mdb.RegisteredUsers.Where(r => r.UserName == userName).FirstOrDefault();
                        //var currentSettings = dbUser.UserSettings;

                        //int startindex = currentSettings.IndexOf(settingName);
                        //int lenToEnd = currentSettings.Substring(startindex, currentSettings.IndexOf("}") + 1).Length;
                        //string elementRemoved = currentSettings.Remove(startindex, lenToEnd);
                        //dbUser.UserSettings = elementRemoved + settingJson;

                        //mdb.SaveChanges();
                        //successModel.Success = "ok";
                        //successModel.ReturnValue = dbUser.UserSettings;
                    }
                }
            }
            catch (Exception ex)
            {
                successModel.Success = Helpers.ErrorDetails(ex);
            }
            return successModel;
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