using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace WebApi
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configuration.EnableCors();

            AreaRegistration.RegisterAllAreas();

            GlobalConfiguration.Configuration.MapHttpAttributeRoutes();

            RouteTable.Routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            RouteTable.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            RouteTable.Routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );

            RouteTable.Routes.MapHttpRoute(
                name: "Custom1",
                routeTemplate: "api/{controller}/{ArticleModel}"
            );

            GlobalConfiguration.Configuration.EnsureInitialized();

            //RouteTable.Routes.MapHubs();


            //Severity Code    Description Project File Line    Suppression State
            //   'SignalRRouteExtensions.MapHubs(RouteCollection)' is obsolete: 
            //  'Use IAppBuilder.MapSignalR in an Owin Startup class. 
            //    See http://go.microsoft.com/fwlink/?LinkId=320578 for more details.'   
            //     WebApi C:\Users\curti\source\repos\Brucheum\WebApi\Global.asax.cs  43  Active



            //GlobalConfiguration.Configure(WebApiConfig.Register);
            //FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            //RouteConfig.RegisterRoutes(RouteTable.Routes);
            //BundleConfig.RegisterBundles(BundleTable.Bundles);
        }
    }
}
