using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime.Serialization.Formatters.Binary;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;

namespace Brucheum
{
    public class MvcApplication : System.Web.HttpApplication
    {

        protected void Application_Start()
        {
            GlobalConfiguration.Configure(Register);

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
            RouteTable.Routes.MapRoute(                name: "Html",                url: "{page}.html",                defaults: new { controller = "Article", action = "HtmlPage", page = UrlParameter.Optional }            );

        }
        //protected void Application_End() {}
        protected void Session_Start()
        {
            try
            {
                if (Request.Cookies["Brucheum"] != null)
                {
                    AddSessionVariables(Request.Cookies["Brucheum"]);
                }
                else
                {
                    if ((Request.Cookies != null) && (Request.Cookies.Count > 0))
                    {
                        AddSessionVariables(Request.Cookies[0]);

                    }
                }
                //GenericIdentity MyIdentity = new GenericIdentity(row.UserName, AuthenticationTypes.Basic);
                //ClaimsIdentity objClaim = new ClaimsIdentity(AuthenticationTypes.Basic, ClaimTypes.Name, "Recipient");
                //objClaim.AddClaim(new Claim(ClaimTypes.Name, row.UserName));
                //objClaim.AddClaim(new Claim(ClaimTypes.AuthenticationMethod, "Level3"));
                //string[] Roles = { "Recipient" };
                //GenericPrincipal MyPrincipal = new GenericPrincipal(objClaim, Roles);
                //IPrincipal Identity = MyPrincipal;
                //HttpContext.Current.User = Identity;
                //System.Threading.Thread.CurrentPrincipal = MyPrincipal;

                LogHit();
            }
            catch (Exception)
            {
                throw;
            }
        }

        private void AddSessionVariables(HttpCookie cookie)
        {
            if (cookie.Values["UseCookie"] != "false")
            {
                Session.Add("UserName", cookie.Values["UserName"]);
                Session.Add("UserId", cookie.Values["UserId"]);
            }
            else
            {
                Session.Add("UserName", cookie.Values["UserName"]);
                Session.Add("UserId", cookie.Values["UserId"]);
            }
        }

        protected void Session_End()
        {
            //string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];
            //using (HttpClient client = new HttpClient())
            //{
            //    HttpResponseMessage response = client.GetAsync(apiService + "/api/HitCounter/EndVisit?hitId=" + (int)Session["HitId"]).Result;
            //}
        }

        public async Task<HttpResponseMessage> LogHit()
        {
            string ipAddress = GetIPAddress();
            string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];
            HttpResponseMessage response = null;
            try
            {
                string exists;
                using (HttpClient client = new HttpClient())
                {
                    response = client.GetAsync(apiService + "/api/HitCounter/Verifiy?ipAddress=" + ipAddress).Result;
                    exists = response.Content.ReadAsStringAsync().Result;
                }
                if (exists == "false")
                {
                    using (HttpClient client = new HttpClient())
                    {
                        ipAddress = JsonConvert.SerializeObject(ipAddress);
                        var content = new StringContent(ipAddress, Encoding.UTF8, "application/json");
                        response = await client.PostAsync(apiService + "/api/HitCounter/", content);
                    }
                }
                else
                {
                    using (HttpClient client = new HttpClient())
                    {
                        ipAddress = JsonConvert.SerializeObject(ipAddress);
                        var content = new StringContent(ipAddress, Encoding.UTF8, "application/json");
                        response = await client.PutAsync(apiService + "/api/HitCounter/", content);
                    }
                }
                Session["HitId"] = await response.Content.ReadAsStringAsync();
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
            }
            return response;
        }

        //async Task<string> GetResponseString(string text)
        //{
        //    var httpClient = new HttpClient();

        //    var parameters = new Dictionary<string, string>();
        //    parameters["text"] = text;

        //    var response = await httpClient.PostAsync(BaseUri, new FormUrlEncodedContent(parameters));
        //    var contents = await response.Content.ReadAsStringAsync();

        //    return contents;
        //}



        private byte[] ObjectToByteArray(VisitorModel obj)
        {
            if (obj == null)
                return null;
            BinaryFormatter bf = new BinaryFormatter();
            using (MemoryStream ms = new MemoryStream())
            {
                bf.Serialize(ms, obj);
                return ms.ToArray();
            }
        }

        private string GetIPAddress()
        {
            String address = "";
            WebRequest request = WebRequest.Create("http://checkip.dyndns.org/");
            using (WebResponse response = request.GetResponse())
            using (StreamReader stream = new StreamReader(response.GetResponseStream()))
            {
                address = stream.ReadToEnd();
            }
            int first = address.IndexOf("Address: ") + 9;
            int last = address.LastIndexOf("</body>");
            address = address.Substring(first, last - first);

            return address;
        }


        public static void Register(HttpConfiguration config)
        {
            //config.EnableCors();

            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
        }
    }


    //protected string GetIPAddress()
    //{
    //string ipAddress = HttpContext.Current.Request.ServerVariables["HTTP_X_FORWARDED_FOR"];
    //            if (!string.IsNullOrEmpty(ipAddress))
    //{
    //    string[] addresses = ipAddress.Split(',');
    //    if (addresses.Length != 0)
    //    {
    //        return addresses[0];
    //    }
    //}
    //return HttpContext.Current.Request.ServerVariables["REMOTE_ADDR"];


    //protected void Application_EndRequest(object sender, EventArgs args)
    //{
    //}
    //protected void Application_Error()
    //{
    //}
    //          Application_AuthenticateRequest –fired just before the user credentials are authenticated.You can specify your own authentication logic over here.
    //          Application_AuthorizeRequest() //– fired on successful authentication of user’s credentials. You can use this method to give authorization rights to user.
    //        Methods that fire on each request
    //          Application_BeginRequest() – fired when a request for the web application comes in.
    //          Application_AuthenticateRequest –fired just before the user credentials are authenticated.You can specify your own authentication logic over here.
    //          Application_AuthorizeRequest() – fired on successful authentication of user’s credentials. You can use this method to give authorization rights to user.
    //          Application_ResolveRequestCache() – fired on successful completion of an authorization request.
    //          Application_AcquireRequestState() – fired just before the session state is retrieved for the current request.
    //          Application_PreRequestHandlerExecute() - fired before the page framework begins before executing an event handler to handle the request.
    //          Application_PostRequestHandlerExecute() – fired after HTTP handler has executed the request.
    //          Application_ReleaseRequestState() – fired before current state data kept in the session collection is serialized.
    //          Application_UpdateRequestCache() – fired before information is added to output cache of the page.
    //          Application_EndRequest() – fired at the end of each request

}
