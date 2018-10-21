using System;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;

namespace Brucheum
{
    //  illegal in XML document  ------
    //WeakReference 
    public class MvcApplication : HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configuration.MapHttpAttributeRoutes();
            RouteTable.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
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

        protected void Application_BeginRequest() //– fired when a request for the web application comes in.
        {
            //NameValueCollection qparams = Request.QueryString;
           HitCounter.PageHit(Request.CurrentExecutionFilePath, Request.QueryString.ToString());
        }

        protected void Session_Start()
        {
            if (Request.Cookies["Brucheum"] != null)
            {
                if (Request.Cookies["Brucheum"].Values["UseCookie"] != "false")
                {
                    Session.Add("UserName", Request.Cookies["Brucheum"].Values["UserName"]);
                    Session.Add("UserId", Request.Cookies["Brucheum"].Values["UserId"]);
                }
            }
            Session.Add("HitId", 0);
            Session["HitId"] = HitCounter.SessionStartHit();
        }
        protected void Application_Error()
        {
            //Session["LastError"] = Server.GetLastError().Message;
            //Server.Transfer("/Error.cshtml");
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
