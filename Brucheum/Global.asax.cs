using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace Brucheum
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }
        protected void Application_BeginRequest() //– fired when a request for the web application comes in.
        {
            Helpers.PageHit(Request.CurrentExecutionFilePath, Request.QueryString.ToString());
        }

        protected void Session_Start()
        {
            Helpers.SessionStart();
        }

        //protected void Application_Error()
        //{
        //    var msg = Helpers.ErrorDetails(Server.GetLastError());
        //    var st = Server.GetLastError().StackTrace.Replace("\r\n", "<br/>");
        //    Response.Redirect("~/Error/AppError?msg=" + msg + "&st=" + st, false);
        //    //if (HttpContext.Current.Session != null)
        //    //{
        //    //    //Session.Add("LastError", Server.GetLastError());
        //    //    Response.Redirect("~/Error/Index?ex="+ Server.GetLastError(), false);
        //    //}
        //}
    }
}
