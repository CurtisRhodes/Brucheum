using System;
using System.Security.Claims;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
//using System.Web.Http.Owin;
using Microsoft.Owin.Security.OAuth;
using Newtonsoft.Json.Serialization;
using System.Web.Optimization;

namespace OggleBooble
{
    public class MvcApplication : HttpApplication
    {
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
            HitCounter.PageHit(Request.CurrentExecutionFilePath, Request.QueryString.ToString());
        }

        protected void Session_Start()
        {
            Session.Add("HitId", 0);
            Session["HitId"] = HitCounter.SessionStartHit();
        }

        protected void Application_Error()
        {
            Session["LastError"] = Server.GetLastError();
            //HttpContext.Current.ClearError();
            //Response.Redirect("~/Home/Error", false);
            Response.Redirect("~/Error", false);
        }
    }
}
