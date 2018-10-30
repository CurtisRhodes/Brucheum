using System;
using System.Security.Claims;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System.Web.Http.Owin;
using Microsoft.Owin.Security.OAuth;
using Newtonsoft.Json.Serialization;
using System.Web.Optimization;

namespace Brucheum
{
    public class MvcApplication : HttpApplication
    {
        private bool sessionHasStarted = false;
        public class BundleConfig
        {
            // For more information on bundling, visit https://go.microsoft.com/fwlink/?LinkId=301862
            public static void RegisterBundles(BundleCollection bundles)
            {
                bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                    "~/Scripts/jquery-{version}.js"));

                bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                    "~/Scripts/jquery.unobtrusive*",
                    "~/Scripts/jquery.validate*"));

                bundles.Add(new ScriptBundle("~/bundles/knockout").Include(
                    "~/Scripts/knockout-{version}.js",
                    "~/Scripts/knockout.validation.js"));

                bundles.Add(new ScriptBundle("~/bundles/app").Include(
                    "~/Scripts/sammy-{version}.js",
                    "~/Scripts/app/common.js",
                    "~/Scripts/app/app.datamodel.js",
                    "~/Scripts/app/app.viewmodel.js",
                    "~/Scripts/app/home.viewmodel.js",
                    "~/Scripts/app/_run.js"));

                // Use the development version of Modernizr to develop with and learn from. Then, when you're
                // ready for production, use the build tool at https://modernizr.com to pick only the tests you need.
                bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                    "~/Scripts/modernizr-*"));

                //bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                //    "~/Scripts/bootstrap.js"));

                //bundles.Add(new StyleBundle("~/Content/css").Include(
                //     "~/Content/bootstrap.css",
                //     "~/Content/Site.css"));
            }
        }

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            BundleConfig.RegisterBundles(BundleTable.Bundles);

            // Web API configuration and services
            // Configure Web API to use only bearer token authentication.
            GlobalConfiguration.Configure(WebApiConfig.Register);

            RouteTable.Routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            RouteTable.Routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
            RouteTable.Routes.MapRoute(
                name: "Start",
                url: "Article/ArticleList"
            );
            RouteTable.Routes.MapRoute(
                name: "Html",
                url: "{page}.html",
                defaults: new { controller = "Article", action = "HtmlPage", page = UrlParameter.Optional }
            );

            GlobalConfiguration.Configuration.EnsureInitialized();
        }

        public static class WebApiConfig
        {
            public static void Register(HttpConfiguration config)
            {
                // Web API configuration and services
                // Configure Web API to use only bearer token authentication.
                config.SuppressDefaultHostAuthentication();
                config.Filters.Add(new HostAuthenticationFilter(OAuthDefaults.AuthenticationType));

                // Use camel case for JSON data.
                config.Formatters.JsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();

                // Web API routes
                config.MapHttpAttributeRoutes();

                config.Routes.MapHttpRoute(
                    name: "DefaultApi",
                    routeTemplate: "api/{controller}/{id}",
                    defaults: new { id = RouteParameter.Optional }
                );
            }
        }

        protected void Application_BeginRequest() //– fired when a request for the web application comes in.
        {
            if (HttpContext.Current.Session != null)
            {
                Helpers.PageHit(Request.CurrentExecutionFilePath, Request.QueryString.ToString());
            }
        }

        protected void Session_Start()
        {
            sessionHasStarted = true;
            Helpers.SessionStart();
        }
        protected void Application_Error()
        {
            if (HttpContext.Current.Session != null)
            {
                Session["LastError"] = Server.GetLastError();
                Response.Redirect("~/Error", false);
            }
        }
    }


    //protected void Page_Unload(object sender, EventArgs e)
    //{
    //    if (IsBeingLogged(Request.CurrentExecutionFilePath))
    //    {
    //        if (Session["HitId"] != null)
    //        {
    //            int hitId = (int)Session["HitId"];
    //            string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];
    //            using (HttpClient client = new HttpClient())
    //            {
    //                HttpResponseMessage response = client.GetAsync(apiService + "/api/HitCounter/EndVisit?hitId=" + hitId).Result;
    //            }
    //        }
    //    }
    //}
    //  illegal in XML document  ------
    //WeakReference 
    //protected void Application_AuthorizeRequest() //– fired on successful authentication of user’s credentials. You can use this method to give authorization rights to user.
    //{ }
    //protected void Application_AuthenticateRequest() //–fired just before the user credentials are authenticated.You can specify your own authentication logic over here.
    //{
    //    //GenericIdentity MyIdentity = new GenericIdentity(row.UserName, AuthenticationTypes.Basic);
    //    //ClaimsIdentity objClaim = new ClaimsIdentity(AuthenticationTypes.Basic, ClaimTypes.Name, "Recipient");
    //    //objClaim.AddClaim(new Claim(ClaimTypes.Name, row.UserName));
    //    //objClaim.AddClaim(new Claim(ClaimTypes.AuthenticationMethod, "Level3"));
    //    //string[] Roles = { "Recipient" };
    //    //GenericPrincipal MyPrincipal = new GenericPrincipal(objClaim, Roles);
    //    //IPrincipal Identity = MyPrincipal;
    //    //HttpContext.Current.User = Identity;
    //    //System.Threading.Thread.CurrentPrincipal = MyPrincipal;
    //}
    //protected void Application_AcquireRequestState() //– fired just before the session state is retrieved for the current request.
    //protected void Application_ReleaseRequestState() //– fired before current state data kept in the session collection is serialized.


    //protected void Application_EndRequest(object sender, EventArgs args)
    //{
    //}
    //Methods that fire on each request
    //  Application_BeginRequest() – fired when a request for the web application comes in.
    //  Application_AuthenticateRequest –fired just before the user credentials are authenticated.You can specify your own authentication logic over here.
    //  Application_AuthorizeRequest() – fired on successful authentication of user’s credentials. You can use this method to give authorization rights to user.
    //  Application_ResolveRequestCache() – fired on successful completion of an authorization request.
    //  Application_AcquireRequestState() – fired just before the session state is retrieved for the current request.
    //  Application_PreRequestHandlerExecute() - fired before the page framework begins before executing an event handler to handle the request.
    //  Application_PostRequestHandlerExecute() – fired after HTTP handler has executed the request.
    //  Application_ReleaseRequestState() – fired before current state data kept in the session collection is serialized.
    //  Application_UpdateRequestCache() – fired before information is added to output cache of the page.
    //  Application_EndRequest() – fired at the end of each request
    //  Application_End() {}

}
