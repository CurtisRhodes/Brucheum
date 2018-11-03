using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;
//using System.Web.Http.Results;
//using System.Web.Mvc.Html..Results;
using Microsoft.AspNet.Identity.Owin;
using System.Security.Claims;
using Microsoft.Owin.Security;
using Microsoft.AspNet.Identity.EntityFramework;
using System.Net.Http;
using Brucheum.Models;

namespace Brucheum
{
    public class LoginController : Controller
    {
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

        public ActionResult Login()
        {
            ViewBag.Service = apiService;
            return PartialView("_LoginPopup");
        }
        [HttpPost]
        [AllowAnonymous]
        public JsonResult Login(LoginViewModel loginVM)
        {
            var rtnLoginVm = new LoginViewModel() { success = "slipped through" };
            try
            {
                if (ModelState.IsValid)
                {
                    rtnLoginVm.UserName = loginVM.UserName;
                    SignInStatus result = SignInManager.PasswordSignInAsync(loginVM.UserName, loginVM.Password, loginVM.RememberMe, shouldLockout: false).Result;
                    if (result == SignInStatus.Success)
                    {
                        rtnLoginVm.success = "ok";
                        rtnLoginVm.IPAddress = Helpers.GetIPAddress();
                        Helpers.SendEmail("SWEET: " + rtnLoginVm.UserName + " just logged In to The Brucheum", "Ip: " + loginVM.IPAddress + " visited: The Brucheum");
                    }
                    else
                    {
                        switch (result)
                        {
                            case SignInStatus.LockedOut:
                                //return View("Lockout");
                                rtnLoginVm.success = "Locked Out";
                                break;
                            case SignInStatus.RequiresVerification:
                                //return RedirectToAction("SendCode", new { ReturnUrl = returnUrl, RememberMe = model.RememberMe });
                                rtnLoginVm.success = "This account has been locked out, please try again later.";
                                break;
                            case SignInStatus.Failure:
                                rtnLoginVm.Password = loginVM.Password;
                                rtnLoginVm.success = "Login Fail";
                                break;
                            default:
                                //ModelState.AddModelError("", "Invalid login attempt.");
                                rtnLoginVm.success = result.ToString();
                                //return View(model);
                                break;
                        }
                    }
                }
                else
                {
                    var modelStateErrors = this.ModelState.Keys.SelectMany(key => this.ModelState[key].Errors);
                    foreach (ModelError e in modelStateErrors)
                    {
                        rtnLoginVm.success += " :" + e.ErrorMessage;
                    }
                }
            }
            catch (Exception ex)
            {
                rtnLoginVm.success = Helpers.ErrorDetails(ex);
            }
            return Json(rtnLoginVm);
        }


        public ActionResult Register()
        {
            return PartialView("_RegisterPopup");
        }
        [HttpPost]
        [AllowAnonymous]
        public JsonResult Register(RegisterViewModel regVM)
        {
            string success = "";
            try
            {
                if (ModelState.IsValid)
                {
                    regVM.IPAddress = Helpers.GetIPAddress();
                    //regVM.Hometown = "HoHoKus";
                    ApplicationUser appUser = new ApplicationUser { UserName = regVM.UserName, IPAddress = regVM.IPAddress };
                    //ApplicationUser appUser = new ApplicationUser { UserName = regVM.UserName, IPAddress = regVM.IPAddress };
                    var result = UserManager.CreateAsync(appUser, regVM.Password).Result;
                    if (result.Succeeded)
                    {
                        Helpers.SendEmail("EXCELLENT: " + regVM.UserName + " just REGISTED In to The Brucheum", "Ip: " + regVM.IPAddress + " registered in for Brucheum");
                        success = LoginRegisteredUser(regVM.UserName, regVM.Password);
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

        private string LoginRegisteredUser(string userName, string password)
        {
            string success = "";
            try
            {
                SignInStatus ssresult = SignInManager.PasswordSignInAsync(userName, password, false, shouldLockout: false).Result;
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
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

        [HttpGet]
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

        [HttpGet]
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

        private void AddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error);
            }
        }
    }

    public class FaceBookUser
    {
        public string FaceBookId { get; set; }
        public string Name { get; set; }
    }
}


