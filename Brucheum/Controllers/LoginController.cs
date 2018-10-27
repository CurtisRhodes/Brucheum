using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;
//using System.Web.Http;
using Microsoft.AspNet.Identity.Owin;
using System.Security.Claims;
using Microsoft.Owin.Security;
using Microsoft.AspNet.Identity.EntityFramework;

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

        public ActionResult LoginPopup()
        {
            ViewBag.Service = apiService;
            return PartialView("_LoginPopup");
        }

        public ActionResult RegisterPopup()
        {
            ViewBag.UserId = Session["UserId"];
            ViewBag.Service = apiService;
            return PartialView("_RegisterPopup");
        }

        public ActionResult Register()
        {
            return View("_RegisterPopup");
        }

        [HttpPost]
        [AllowAnonymous]
        //[ValidateAntiForgeryToken]
        public string Register(RegisterModel regVM)
        {
            string success = "";
            try
            {
                if (ModelState.IsValid)
                {
                    ApplicationUser appUser = new ApplicationUser { UserName = regVM.UserName, Email = regVM.Email };  //  , Hometown = model.Hometown 

                    //UserManager.AccessFailed;
                    //UserManager.AddLogin
                    //UserManager.Create(user, password);

                    var result = UserManager.CreateAsync(appUser, regVM.Password).Result;
                    if (result.Succeeded)
                    {
                        Task ss = SignInManager.SignInAsync(appUser, isPersistent: regVM.RememberMe, rememberBrowser: regVM.RememberMe);

                        success = "ok";
                    }
                    if (success != "ok")
                    {
                        foreach (string e in result.Errors)
                        {
                            success += " :" + e;
                            //ModelState.AddModelError("", error);
                        }
                    }
                    //AddErrors(result);
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
                success = ex.Message;
            }
            return success;  // View(model);
        }

        [HttpPost]
        [AllowAnonymous]
        //[ValidateAntiForgeryToken]
        public string Login(LoginModel loginVM)
        {
            string success = "";
            try
            {
                if (ModelState.IsValid)
                {
                    SignInStatus result = SignInManager.PasswordSignInAsync(loginVM.UserName, loginVM.Password, loginVM.RememberMe, shouldLockout: false).Result;
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
                                success = "Unspecified failure";
                                break;
                            default:
                                //ModelState.AddModelError("", "Invalid login attempt.");
                                success = "Invalid login attempt.";
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
                        success += " :" + e.ErrorMessage;
                    }
                }
            }
            catch (Exception ex)
            {
                success = ex.Message;
            }
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
        public string SetCookie(string userName, string userId, string useCookie)
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
        public string DeleteCookie()
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
    class MyAuthenticationManager : IAuthenticationManager
    {
        public ClaimsPrincipal User { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
        public AuthenticationResponseChallenge AuthenticationResponseChallenge { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
        public AuthenticationResponseGrant AuthenticationResponseGrant { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
        public AuthenticationResponseRevoke AuthenticationResponseRevoke { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

        public Task<AuthenticateResult> AuthenticateAsync(string authenticationType)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<AuthenticateResult>> AuthenticateAsync(string[] authenticationTypes)
        {
            throw new NotImplementedException();
        }

        public void Challenge(AuthenticationProperties properties, params string[] authenticationTypes)
        {
            throw new NotImplementedException();
        }

        public void Challenge(params string[] authenticationTypes)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<AuthenticationDescription> GetAuthenticationTypes()
        {
            throw new NotImplementedException();
        }

        public IEnumerable<AuthenticationDescription> GetAuthenticationTypes(Func<AuthenticationDescription, bool> predicate)
        {
            throw new NotImplementedException();
        }

        public void SignIn(AuthenticationProperties properties, params ClaimsIdentity[] identities)
        {
            throw new NotImplementedException();
        }

        public void SignIn(params ClaimsIdentity[] identities)
        {
            throw new NotImplementedException();
        }

        public void SignOut(AuthenticationProperties properties, params string[] authenticationTypes)
        {
            throw new NotImplementedException();
        }

        public void SignOut(params string[] authenticationTypes)
        {
            throw new NotImplementedException();
        }
    }
    class MyUserUser : IUser    {
        string IUser<string>.Id => throw new NotImplementedException();

        string IUser<string>.UserName { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
    }
    class MyUserManager : UserManager<ApplicationUser>
    {
        public MyUserManager(IUserStore<ApplicationUser> store)
            : base(store) {
        }    
    }
    public class MyApplicationDbContext : IdentityDbContext<ApplicationUser>
    { }
}


