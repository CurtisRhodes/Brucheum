using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Brucheum
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "Start",
                url: "Article/ArticleList"
            );

            routes.MapRoute(
                name: "Html",
                url: "{page}.html",
                defaults: new { controller = "Article", action = "HtmlPage", page = UrlParameter.Optional }
            );
        }

        //public static class WebApiConfig
        //{
        //    public static void Register(System.Web.HttpConfiguration config)
        //    {
        //        // Web API configuration and services
        //        // Configure Web API to use only bearer token authentication.
        //        //config.SuppressDefaultHostAuthentication();
        //        //config.Filters.Add(new HostAuthenticationFilter(OAuthDefaults.AuthenticationType));

        //        // Use camel case for JSON data.
        //        //config.Formatters.JsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();

        //        // Web API routes
        //        config.MapHttpAttributeRoutes();

        //        config.Routes.MapHttpRoute(
        //            name: "DefaultApi",
        //            routeTemplate: "api/{controller}/{id}",
        //            defaults: new { id = RouteParameter.Optional }
        //        );
        //    }
        //}
    }
}
