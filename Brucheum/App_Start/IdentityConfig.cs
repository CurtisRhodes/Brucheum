using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using Microsoft.Owin.Security;
using Brucheum.Models;

namespace Brucheum
{
    public class EmailService : IIdentityMessageService
    {
        public Task SendAsync(IdentityMessage message)
        {
            // Plug in your email service here to send an email.
            return Task.FromResult(0);
        }
    }

    public class SmsService : IIdentityMessageService
    {
        public Task SendAsync(IdentityMessage message)
        {
            // Plug in your SMS service here to send a text message.
            return Task.FromResult(0);
        }
    }

    // this manager I built 
    public class ApplicationRoleManager : UserManager<ApplicationUser>
    {
        public ApplicationRoleManager(IUserStore<ApplicationUser> store) : base(store) { }
        public static ApplicationRoleManager Create(IdentityFactoryOptions<ApplicationRoleManager> options, IOwinContext context)
        {
            //return new ApplicationRoleManager(new UserStore<ApplicationUser>(context.Get<ApplicationDbContext>()));
            var manager = new ApplicationRoleManager(new UserStore<ApplicationUser>(context.Get<ApplicationDbContext>()));
            return manager;
        }


        public RoleModel AddRole(string roleName)
        {
            RoleModel roleModel = new RoleModel() { Name = roleName };

            try
            {
                using (var context = new ApplicationDbContext())
                {
                    using (var roleStore = new RoleStore<IdentityRole>(context))
                    {
                        using (var roleManager = new RoleManager<IdentityRole>(roleStore))
                        {
                            IdentityRole role = new IdentityRole(roleName);
                            Task taskCreateRole = roleStore.CreateAsync(role);
                            int i = 0;
                            while (!taskCreateRole.IsCompleted)
                            {
                                i++;
                            }
                            if (taskCreateRole.IsFaulted)
                            {
                                TaskStatus taskStatus = taskCreateRole.Status;
                                roleModel.success = taskStatus.ToString();
                            }
                            else
                            {
                                roleModel.success = "ok";
                                roleModel.Id = role.Id;
                            }
                        }
                    }
                }
            }
            catch (Exception ex) { roleModel.success = Helpers.ErrorDetails(ex); }
            return roleModel;
        }

        public string AddUserRole(string userId, string roleName)
        {
            string success = "Error: ";
            try
            {
                Claim claim = new Claim(ClaimTypes.Role, roleName);
                IdentityResult addCalimResult = this.AddClaim(userId, claim);
                if (addCalimResult.Succeeded)
                {
                    var result = this.AddToRole(userId, roleName);
                    if (result.Succeeded)
                        success = "ok";
                    else
                        foreach (string error in result.Errors) { success += error + " "; }
                }
                else
                    foreach (string error in addCalimResult.Errors) { success += error + " "; }

            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        public string RemoveUserRole(string userId, string roleName)
        {
            string success = "not found";
            try
            {
                List<Claim> claims = this.GetClaims(userId).ToList();
                foreach (Claim claim in claims)
                {
                    if ((claim.Type == ClaimTypes.Role) && (claim.Value == roleName))
                    {
                        this.RemoveClaim(userId, claim);
                        success = "ok";
                        break;
                    }
                }
                this.RemoveFromRole(userId, roleName);
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    // Configure the application user manager used in this application. UserManager is defined in ASP.NET Identity and is used by the application.
    public class ApplicationUserManager : UserManager<ApplicationUser>
    {
        public ApplicationUserManager(IUserStore<ApplicationUser> store) : base(store) { }

        public static ApplicationUserManager Create(IdentityFactoryOptions<ApplicationUserManager> options, IOwinContext context)
        {
            var manager = new ApplicationUserManager(new UserStore<ApplicationUser>(context.Get<ApplicationDbContext>()));
            // Configure validation logic for usernames
            manager.UserValidator = new UserValidator<ApplicationUser>(manager)
            {
                AllowOnlyAlphanumericUserNames = false,
                RequireUniqueEmail = false
            };

            // Configure validation logic for passwords
            manager.PasswordValidator = new PasswordValidator
            {
                RequiredLength = 4,
                RequireNonLetterOrDigit = false,
                RequireDigit = false,
                RequireLowercase = false,
                RequireUppercase = false,
            };

            // Configure user lockout defaults
            manager.UserLockoutEnabledByDefault = true;
            manager.DefaultAccountLockoutTimeSpan = TimeSpan.FromMinutes(5);
            manager.MaxFailedAccessAttemptsBeforeLockout = 5;

            // Register two factor authentication providers. This application uses Phone and Emails as a step of receiving a code for verifying the user
            // You can write your own provider and plug it in here.
            manager.RegisterTwoFactorProvider("Phone Code", new PhoneNumberTokenProvider<ApplicationUser>
            {
                MessageFormat = "Your security code is {0}"
            });
            manager.RegisterTwoFactorProvider("Email Code", new EmailTokenProvider<ApplicationUser>
            {
                Subject = "Security Code",
                BodyFormat = "Your security code is {0}"
            });
            manager.EmailService = new EmailService();
            manager.SmsService = new SmsService();
            var dataProtectionProvider = options.DataProtectionProvider;
            if (dataProtectionProvider != null)
            {
                manager.UserTokenProvider =
                    new DataProtectorTokenProvider<ApplicationUser>(dataProtectionProvider.Create("ASP.NET Identity"));
            }
            return manager;
        }
    }

    // Configure the application sign-in manager which is used in this application.
    public class ApplicationSignInManager : SignInManager<ApplicationUser, string>
    {
        public ApplicationSignInManager(ApplicationUserManager userManager, IAuthenticationManager authenticationManager)
            : base(userManager, authenticationManager)
        {
        }

        public override Task<ClaimsIdentity> CreateUserIdentityAsync(ApplicationUser user)
        {
            return user.GenerateUserIdentityAsync((ApplicationUserManager)UserManager);
        }

        public static ApplicationSignInManager Create(IdentityFactoryOptions<ApplicationSignInManager> options, IOwinContext context)
        {
            return new ApplicationSignInManager(context.GetUserManager<ApplicationUserManager>(), context.Authentication);
        }
    }

    // You can add profile data for the user by adding more properties to your ApplicationUser class
    public class ApplicationUser : IdentityUser
    {
        public string IPAddress { get; set; }

        public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<ApplicationUser> manager)
        {
            // Note the authenticationType must match the one defined in CookieAuthenticationOptions.AuthenticationType
            var userIdentity = await manager.CreateIdentityAsync(this, DefaultAuthenticationTypes.ApplicationCookie);
            // Add custom user claims here
            return userIdentity;
        }
    }

    public class ApplicationDbContext : Microsoft.AspNet.Identity.EntityFramework.IdentityDbContext<ApplicationUser>
    {
        static string connstring = System.Configuration.ConfigurationManager.ConnectionStrings["GoDaddy"].ConnectionString;

        public ApplicationDbContext()
            : base(connstring, throwIfV1Schema: false)
        {
        }

        public static ApplicationDbContext Create()
        {
            var x = new ApplicationDbContext();
            return new ApplicationDbContext();
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("asp");
            base.OnModelCreating(modelBuilder);
        }


    }


    //public class ApplicationRoleManager2 : RoleManager<IdentityRole>
    //{
    //    public ApplicationRoleManager2(IRoleStore<IdentityRole, string> roleStore)
    //        : base(roleStore)
    //    {
    //    }

    //    public static ApplicationRoleManager Create(IdentityFactoryOptions<ApplicationRoleManager> options, IOwinContext context)
    //    {
    //        var appRoleManager = new ApplicationRoleManager(new RoleStore<IdentityRole>(context.Get<ApplicationDbContext>()));

    //        return appRoleManager;
    //    }
    //}

    class AuthenticationManagerExplixitImplimentation : IAuthenticationManager
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



}

