using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using Brucheum.Models;
using System.Security.Claims;
using Microsoft.Owin.Security.Facebook;
using Microsoft.AspNet.Identity.EntityFramework;

namespace Brucheum
{
    public class LoginController : Controller
    {
        #region constructors
        //private string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];
        private ApplicationSignInManager _signInManager;
        private ApplicationUserManager _userManager;

        public LoginController()        {        }
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
        public ActionResult Register()
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
            //ViewBag.Service = apiService;
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

        // facebook  -------------------------------------------------------------
        [HttpPost]
        public ActionResult FacebookLogin(FacebookViewModel facebookViewModel)
            //FacebookViewModel UserName Email FacebookId
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



        public ActionResult ShowCustomMessage(string errMessage)
        {
            try
            {
                return View("showCustomMessage(" + errMessage + ")");

            }
            catch (Exception)
            {

                throw;
            }
        }


        public string xxSetCookie(string userName, string userId, string useCookie)
        {

            //var user = new ApplicationUserManager();

            string success = "oh no";
            try
            {
                Session["UserName"] = userName;
                Session["UserId"] = userId;

                HttpCookie brucheumCookie = Request.Cookies["Brucheum"];
                if (brucheumCookie == null)
                {
                    brucheumCookie = new HttpCookie("Brucheum");
                }
                brucheumCookie.Name = "Brucheum";
                brucheumCookie.Values["UserName"] = userName;
                brucheumCookie.Values["UserId"] = userId;
                brucheumCookie.Values["UseCookie"] = useCookie;
                brucheumCookie.Expires = DateTime.Now.AddMonths(1);

                Response.Cookies.Add(brucheumCookie);
                success = "ok";
            }
            catch (Exception ex)
            {
                success = ex.Message;
            }
            return success;
        }
        public string xxDeleteCookie()
        {
            var success = "on no";
            Session["UserName"] = null;
            Session["UserId"] = null;
            HttpCookie brucheumCookie = Request.Cookies["Brucheum"];
            if (brucheumCookie == null)
            {
                success = "no cookie found";
            }
            else
            {
                brucheumCookie["UserName"] = "";
                brucheumCookie["UserId"] = "";
                brucheumCookie["UseCookie"] = "false";
                brucheumCookie.Expires = DateTime.Now.AddDays(-1);
                Response.Cookies.Add(brucheumCookie);
                success = "ok";
            }
            return success;
        }
        private void xxAddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error);
            }
        }
    }
}


