using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Routing;

namespace OggleBooble.Api
{
    public class WebApiApplication : HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configuration.EnableCors();

            GlobalConfiguration.Configuration.MapHttpAttributeRoutes();

            //RouteTable.Routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            RouteTable.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{action}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            GlobalConfiguration.Configuration.EnsureInitialized();

        }

        //protected void Application_BeginRequest(Object sender, EventArgs e)
        //{
        //    // Preflight request comes with HttpMethod OPTIONS
        //    // The following line solves the error message
        //    HttpContext.Current.Response.AddHeader("Access-Control-Allow-Origin", "*");
        //    if (HttpContext.Current.Request.HttpMethod == "OPTIONS")
        //    {
        //        HttpContext.Current.Response.AddHeader("Cache-Control", "no-cache");
        //        HttpContext.Current.Response.AddHeader("Access-Control-Allow-Methods", "GET, POST");
        //        // If any http headers are shown in preflight error in browser console add them below
        //        HttpContext.Current.Response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Pragma, Cache-Control, Authorization ");
        //        HttpContext.Current.Response.End();
        //    }
        //}
    }
}

    //System.Net.Http.Formatting, Version=5.2.7.0, C