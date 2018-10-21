using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
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

namespace OggleBooble
{
    public class MvcApplication : HttpApplication
    {
        protected void Application_Start()
        {
            //GlobalConfiguration.Configuration.MapHttpAttributeRoutes();
            //GlobalFilterCollection.Add(new HandleErrorAttribute());
            //Configuration.MapHttpAttributeRoutes();

            RouteTable.Routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            RouteTable.Routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
            //GlobalConfiguration.Configuration.EnsureInitialized();
        }
        protected void Session_Start()
        {
            if (Request.Cookies["OggleBooble"] != null)
            {
                if (Request.Cookies["OggleBooble"].Values["UseCookie"] != "false")
                {
                    Session.Add("UserName", Request.Cookies["OggleBooble"].Values["UserName"]);
                    Session.Add("UserId", Request.Cookies["OggleBooble"].Values["UserId"]);
                }
            }
            else
            {
                //if ((Request.Cookies != null) && (Request.Cookies.Count > 0))
                //{
                //    Session.Add("UserName", Request.Cookies[0].Values["UserName"]);
                //    Session.Add("UserId", Request.Cookies[0].Values["UserId"]);
                //}
                //else
                {
                    Session.Add("UserName", "No Cookies Found");
                    Session.Add("UserId", "No Cookies Found");
                }
            }
            Session.Add("HitId", 0);
            Session["HitId"] = SessionStartHit("Session_Start", Session["UserId"].ToString());
        }

        protected void Application_BeginRequest() //– fired when a request for the web application comes in.
        {
            PageHit(Request.CurrentExecutionFilePath, Request.QueryString.ToString());
        }

        private string SessionStartHit(string session, string userId)
        {
            var hitId = "onNo";
            try
            {
                string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];
                using (HttpClient client = new HttpClient())
                {
                    string ipAddress = GetIPAddress();  ///Request.UserHostAddress;
                    HttpResponseMessage response = client.GetAsync(apiService + "/api/HitCounter/Verifiy?ipAddress=" + ipAddress + "&app=OggleBooble").Result;
                    string exists = response.Content.ReadAsStringAsync().Result;
                    if (exists == "false")
                    {
                        // WE HAVE A NEW VISITOR
                        response = client.GetAsync(apiService + "/api/HitCounter/AddVisitor?ipAddress=" + ipAddress + "&app=OggleBooble&userId=" + userId).Result;
                    }
                }
            }
            catch (Exception ex)
            {
                hitId = ex.Message;
            }
            return hitId; ;
        }

        private bool IsBeingLogged(string page)
        {
            bool allow = false;
            switch (page)
            {
                case "/":
                case "/Login/SetOggleBoobleCookie":
                    allow = false;
                    break;
                case "/Home/Index":
                case "/Home/transitions":
                case "/Home/Transitions":
                case "/Home/Gallery":
                case "/Home/ImagePage":
                case "/Home/Viewer":
                case "/Login/LoginPopup":
                case "/Login/LogoutPopup":
                case "/Login/ProfilePopup":
                case "/Login/RegisterPopup":
                    allow = true;
                    break;
                default:
                    Console.Write("Page Nothandled" + page);
                    break;
            }
            return allow;
        }

        private void PageHit(string page, string details)
        {
            string ipAddress = GetIPAddress();
            //if (ipAddress != "68.203.92.166")
            { // my development machine
                if (IsBeingLogged(page))
                {
                    using (HttpClient client = new HttpClient())
                    {
                        try
                        {//AddPageHit(string ipAddress, string app, string page, string details)
                            string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];
                            HttpResponseMessage response = client.GetAsync(
                                apiService + "/api/HitCounter/AddPageHit?ipAddress=" + ipAddress + "&app=OggleBooble&page=" + page + "&details=" + details).Result;
                            //string exists = response.Content.ReadAsStringAsync().Result;
                        }
                        catch (Exception ex)
                        {
                            Console.Write(ex.Message);
                            throw;
                        }
                    }
                }
            }
        }

        private string GetIPAddress()
        {
            String address = "";
            WebRequest request = WebRequest.Create("http://checkip.dyndns.org/");
            using (WebResponse response = request.GetResponse())
            {
                using (StreamReader stream = new StreamReader(response.GetResponseStream()))
                {
                    address = stream.ReadToEnd();
                }
                int first = address.IndexOf("Address: ") + 9;
                int last = address.LastIndexOf("</body>");
                address = address.Substring(first, last - first);

                return address;
            }
        }


    }
}
