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
        protected void Application_Start()
        {
            RouteTable.Routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            RouteTable.Routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
        }

        protected void Application_BeginRequest() //– fired when a request for the web application comes in.
        {
            //Helpers.PageHit(Request.CurrentExecutionFilePath, Request.QueryString.ToString());
#if !DEBUG
            if (!Request.IsSecureConnection)
            {
                string path = string.Format("https{0}", Request.Url.AbsoluteUri.Substring(4));
                Response.Redirect(path);
            }        
#endif
        }

        protected void Session_Start()
        {
            //Helpers.SessionStart();
        }

        protected void Application_Error()
        {
            //if (HttpContext.Current.Session != null)
            //{
            //    var msg = Helpers.ErrorDetails(Server.GetLastError()).Replace(Environment.NewLine, "<br/>");
            //    var st = Server.GetLastError().StackTrace.Replace(Environment.NewLine, "<br/>");
            //    Response.Redirect("~/Error/ErrorwMessages?msg=" + msg + "&st=" + st, false);
            //}
            //else
            //{
            //    Response.Redirect("~/Error/", false);
            //}
        }
    }
}
