using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace Brucheum
{
    public class MvcApplication : System.Web.HttpApplication
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

        protected async Task<JsonResult> Application_BeginRequest() //– fired when a request for the web application comes in.
        {
            await Helpers.PageHit(Request.CurrentExecutionFilePath, Request.QueryString.ToString());
            return null;
        }

        protected async Task<JsonResult> Session_Start()
        {
            await Helpers.SessionStart();
            return null;
        }

        protected void Application_Error()
        {
            var msg = Helpers.ErrorDetails(Server.GetLastError());
            var st = Server.GetLastError().StackTrace.Replace("\r\n", "<br/>");
            Response.Redirect("~/Error/Index?msg=" + msg + "&st=" + st, false);
            //if (HttpContext.Current.Session != null)
            //{
            //    //Session.Add("LastError", Server.GetLastError());
            //    Response.Redirect("~/Error/Index?ex="+ Server.GetLastError(), false);
            //}
        }
    }
}
