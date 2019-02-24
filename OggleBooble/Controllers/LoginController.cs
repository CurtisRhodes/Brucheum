﻿using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using OggleBooble.Models;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace OggleBooble.Controllers
{
    public class LoginController : Controller
    {
        #region constructors
        //private string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];
        private ApplicationSignInManager _signInManager;
        private ApplicationUserManager _userManager;

        public LoginController() { }
        public LoginController(ApplicationUserManager userManager, ApplicationSignInManager signInManager)
        {
            UserManager = userManager;
            SignInManager = signInManager;
        }

        public ApplicationSignInManager SignInManager
        {
            get
            {
                if (_signInManager == null)
                {
                    //SignInManager x = new  
                }
                return _signInManager ?? HttpContext.GetOwinContext().Get<ApplicationSignInManager>();
            }
            private set
            {
                _signInManager = value;
            }
        }
        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }
        private IAuthenticationManager AuthenticationManager
        {
            get
            {
                return HttpContext.GetOwinContext().Authentication;
            }
        }
        #endregion


        // register ------------------------------------------------------------
        public ActionResult Register()  //  RegisterPopup()
        {
            return PartialView("_RegisterPopup");
        }
        [HttpPost]
        public async Task<JsonResult> RegisterAndLogin(RegisterViewModel regVM)
        {
            string success = "";
            try
            {
                if (ModelState.IsValid)
                {
                    regVM.IPAddress = Helpers.GetIPAddress();
                    ApplicationUser appUser = new ApplicationUser
                    {
                        Email = regVM.Email,
                        FirstName = regVM.FirstName,
                        LastName = regVM.LastName,
                        UserName = regVM.UserName,
                        IPAddress = regVM.IPAddress
                    };
                    var result = UserManager.CreateAsync(appUser, regVM.Password).Result;
                    if (result.Succeeded)
                    {
                        var jsonSuccess = await LoginRegisteredUser(regVM);
                        success = jsonSuccess.Data.ToString();
                    }
                    else
                    {
                        foreach (string e in result.Errors)
                        {
                            success += " :" + e;
                        }
                    }
                }
                else
                {
                    var modelStateErrors = this.ModelState.Keys.SelectMany(key => this.ModelState[key].Errors);
                    foreach (ModelError e in modelStateErrors)
                    {
                        success += " :" + e.ErrorMessage;
                    }
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return Json(success);
        }

        // login ----------------------------------------------------------------
        public ActionResult LoginPopup()
        {
            return PartialView("_LoginPopup");
        }
        [HttpPost]
        public async Task<JsonResult> Login(LoginViewModel loginVM)
        {
            string success = "";
            try
            {
                if (ModelState.IsValid)
                {
                    JsonResult jsonResult = await LoginRegisteredUser(loginVM);
                    success = jsonResult.Data.ToString();
                }
                else
                {
                    var modelStateErrors = this.ModelState.Keys.SelectMany(key => this.ModelState[key].Errors);
                    foreach (ModelError e in modelStateErrors)
                    {
                        success += " :" + e.ErrorMessage;
                    }
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return Json(success);
        }

        // logout ---------------------------------------------------------------
        public string Logout()
        {
            string success = "";
            try
            {
                Session.Remove("accessToken");   //sessionStorage.removeItem('accessToken');
                AuthenticationManager.SignOut(DefaultAuthenticationTypes.ApplicationCookie);
                success = "ok";
            }
            catch (Exception ex) { success = ex.Message; }
            return success;
        }

        // profile --------------------------------------------------------------
        public ActionResult ProfilePopup()
        {
            //ViewBag.UserId = Session["UserId"];
            //ViewBag.Service = apiService;
            //return PartialView("_RegisterPopup");
            var uid = User.Identity.GetUserId();
            ApplicationUser usr = UserManager.FindById(uid);
            ViewBag.FirstName = usr.FirstName;
            ViewBag.LastName = usr.LastName;
            ViewBag.PhoneNumber = usr.PhoneNumber;
            ViewBag.UserName = usr.UserName;
            ViewBag.Email = usr.Email;
            return PartialView("_ProfilePopup");
        }

        [HttpPut]
        public string UpdateProfile(ProfileViewModel profileViewModel)
        {
            string success = "";
            if (ModelState.IsValid)
            {
                try
                {
                    ApplicationUser usr = UserManager.FindById(User.Identity.GetUserId());
                    usr.FirstName = profileViewModel.FirstName;
                    usr.LastName = profileViewModel.LastName;
                    usr.PhoneNumber = profileViewModel.PhoneNumber;
                    usr.UserName = profileViewModel.UserName;
                    usr.Email = profileViewModel.Email;

                    UserManager.Update(usr);
                    success = "ok";
                }
                catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            }
            else
            {
                var modelStateErrors = this.ModelState.Keys.SelectMany(key => this.ModelState[key].Errors);
                foreach (ModelError e in modelStateErrors)
                {
                    success += " :" + e.ErrorMessage;
                }
            }
            return success;
        }

        [HttpPost]
        public ActionResult FacebookLogin(FacebookViewModel facebookViewModel)
        {
            string success = "";
            try
            {
                ExternalLoginInfo loginInfo = AuthenticationManager.GetExternalLoginInfo();

                loginInfo.Email = facebookViewModel.Email;
                loginInfo.DefaultUserName = facebookViewModel.UserName;
                //loginInfo.ExternalIdentity
                //loginInfo.Login.ProviderKey
                loginInfo.Login.LoginProvider = "Facebook";

                SignInStatus signInStatus = SignInManager.ExternalSignIn(loginInfo, true);
                success = "fbk " + signInStatus.ToString();
            }
            catch (Exception ex)
            {
                success = "try " + Helpers.ErrorDetails(ex);
            }
            return Json(success);
        }

        // helpers   -------------------------------------------------------------
        private async Task<JsonResult> LoginRegisteredUser(LoginViewModel loginVM)
        {
            string success = "";
            try
            {
                SignInStatus result = await SignInManager.PasswordSignInAsync(loginVM.UserName, loginVM.Password, loginVM.RememberMe, shouldLockout: false);
                if (result == SignInStatus.Success)
                {
                    success = "ok";
                }
                else
                {
                    switch (result)
                    {
                        case SignInStatus.LockedOut:
                            //return View("Lockout");
                            success = "Locked Out";
                            break;
                        case SignInStatus.RequiresVerification:
                            //return RedirectToAction("SendCode", new { ReturnUrl = returnUrl, RememberMe = model.RememberMe });
                            success = "This account has been locked out, please try again later.";
                            break;
                        case SignInStatus.Failure:
                            success = "Login Fail";
                            break;
                        default:
                            //ModelState.AddModelError("", "Invalid login attempt.");
                            success = result.ToString();
                            //return View(model);
                            break;
                    }
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return Json(success);
        }



        //[HttpGet]
        //public string SetoggleBoobleCookie(string userName, string userId, string useCookie)
        //{
        //    string success = "oh no";
        //    try
        //    {
        //        Session["UserName"] = userName;
        //        Session["UserId"] = userId;

        //        HttpCookie oggleBoobleCookie = Request.Cookies["OggleBooble"];
        //        if (oggleBoobleCookie == null)
        //        {
        //            oggleBoobleCookie = new HttpCookie("OggleBooble");
        //        }
        //        oggleBoobleCookie.Name = "OggleBooble";
        //        oggleBoobleCookie.Values["UserName"] = userName;
        //        oggleBoobleCookie.Values["UserId"] = userId;
        //        oggleBoobleCookie.Values["UseCookie"] = useCookie;
        //        oggleBoobleCookie.Expires = DateTime.Now.AddMonths(1);

        //        Response.Cookies.Add(oggleBoobleCookie);

        //        success = "ok";
        //    }
        //    catch (Exception ex)
        //    {
        //        success = ex.Message;
        //    }
        //    return success;
        //}

        //[HttpGet]
        //public string DeleteCookie()
        //{
        //    var success = "on no";
        //    Session["UserName"] = null;
        //    Session["UserId"] = null;
        //    HttpCookie oggleBoobleCookie = Request.Cookies["OggleBooble"];
        //    if (oggleBoobleCookie == null)
        //    {
        //        success = "no cookie found";
        //    }
        //    else
        //    {
        //        oggleBoobleCookie["UserName"] = "";
        //        oggleBoobleCookie["UserId"] = "";
        //        oggleBoobleCookie["UseCookie"] = "false";
        //        oggleBoobleCookie.Expires = DateTime.Now.AddDays(-1);
        //        Response.Cookies.Add(oggleBoobleCookie);
        //        success = "ok";
        //    }
        //    return success;
        //}
    }
}
  