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

namespace Brucheum
{
    public class LoginController : Controller
    {
        #region constructors
        private string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];
        private ApplicationSignInManager _signInManager;
        private ApplicationUserManager _userManager;

        public LoginController()
        {
        }
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

        public ActionResult Login()
        {
            ViewBag.Service = apiService;
            return PartialView("_LoginPopup");
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<JsonResult> Login(LoginViewModel loginVM)
        {
            try
            {
                if (ModelState.IsValid)
                    await LoginRegisteredUser(loginVM);
                else
                {
                    var modelStateErrors = this.ModelState.Keys.SelectMany(key => this.ModelState[key].Errors);
                    foreach (ModelError e in modelStateErrors)
                    {
                        loginVM.success += " :" + e.ErrorMessage;
                    }
                }
            }
            catch (Exception ex)
            {
                loginVM.success = Helpers.ErrorDetails(ex);
            }
            return Json(loginVM);
        }

        public ActionResult Register()
        {
            return PartialView("_RegisterPopup");
        }

        [HttpPost]
        public async Task<JsonResult> Register(RegisterViewModel regVM)
        {
            string success = "";
            try
            {
                if (ModelState.IsValid)
                {
                    //regVM.IPAddress = Helpers.GetIPAddress();
                    //regVM.Hometown = "HoHoKus";
                    ApplicationUser appUser = new ApplicationUser { UserName = regVM.UserName, IPAddress = regVM.IPAddress };
                    //ApplicationUser appUser = new ApplicationUser { UserName = regVM.UserName, IPAddress = regVM.IPAddress };
                    var result = UserManager.CreateAsync(appUser, regVM.Password).Result;
                    if (result.Succeeded)
                    {
                        LoginViewModel loginViewModel = new LoginViewModel()
                        {
                            UserName = regVM.UserName,
                            Password = regVM.Password,
                            RememberMe = false
                        };
                        await LoginRegisteredUser(loginViewModel);
                        success = loginViewModel.success;
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

        // helper
        private async Task<JsonResult> LoginRegisteredUser(LoginViewModel loginVM)
        {
            string success = "";
            try
            {
                SignInStatus result = SignInManager.PasswordSignInAsync(loginVM.UserName, loginVM.Password, loginVM.RememberMe, shouldLockout: false).Result;
                if (result == SignInStatus.Success)
                {
                    loginVM.IPAddress = Helpers.GetIPAddress();
                    loginVM.success = await Helpers.SendEmail("SWEET: " + loginVM.UserName + " just logged In to The Brucheum", "Ip: " + loginVM.IPAddress + " visited: The Brucheum");
                }
                else
                {
                    switch (result)
                    {
                        case SignInStatus.LockedOut:
                            //return View("Lockout");
                            loginVM.success = "Locked Out";
                            break;
                        case SignInStatus.RequiresVerification:
                            //return RedirectToAction("SendCode", new { ReturnUrl = returnUrl, RememberMe = model.RememberMe });
                            loginVM.success = "This account has been locked out, please try again later.";
                            break;
                        case SignInStatus.Failure:
                            loginVM.Password = loginVM.Password;
                            loginVM.success = "Login Fail";
                            break;
                        default:
                            //ModelState.AddModelError("", "Invalid login attempt.");
                            loginVM.success = result.ToString();
                            //return View(model);
                            break;
                    }
                }
                //SignInStatus ssresult = SignInManager.PasswordSignInAsync(userName, password, false, shouldLockout: false).Result;
                //var x = ssresult.ToString();
                success = loginVM.success;   
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return Json(success);
        }
        
        [HttpPost]
        public string Logout()
        {
            string success = "";
            try
            {
                AuthenticationManager.SignOut(DefaultAuthenticationTypes.ApplicationCookie);
                success = "ok";
            }
            catch (Exception ex) { success = ex.Message; }
            return success;
        }

        public ActionResult ProfilePopup()
        {
            ViewBag.UserId = Session["UserId"];
            ViewBag.Service = apiService;
            //return PartialView("_RegisterPopup");
            return PartialView("_ProfilePopup");
        }

        [HttpPost]
        public ActionResult FacebookLogin(string faceBookId, string email, string name)
        {
            string success = "";
            try
            {

            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return Json(success);
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

    public class xxFaceBookUser
    {
        public string FaceBookId { get; set; }
        public string Name { get; set; }
    }
}


