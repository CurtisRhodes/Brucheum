using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime.Serialization.Formatters.Binary;
using System.Web;

namespace OggleBooble
{
    public class Helpers
    {
        public static string SessionStartHit()
        {
            var success = "onNo";
            try
            {
                string ipAddress = GetIPAddress();
                if (ipAddress != "68.203.92.166")  // my development machine
                {
                    string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];
                    using (HttpClient client = new HttpClient())
                    {
                        HttpResponseMessage response = client.GetAsync(apiService + "/api/HitCounter/Verify?ipAddress=" + ipAddress + "&app=Brucheum").Result;
                        string exists = response.Content.ReadAsStringAsync().Result;
                        if (exists == "false")
                        {
                            // WE HAVE A NEW VISITOR
                            response = client.GetAsync(apiService + "/api/HitCounter/AddVisitor?ipAddress=" + ipAddress + "&app=Brucheum&userId=duh").Result;
                            success = response.Content.ReadAsStringAsync().Result;
                            if (success.StartsWith("ERROR"))
                            {
                                Console.Write(success);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                success = ex.Message;
            }
            return success;
        }

        public static void PageHit(string page, string details)
        {
            if (IsBeingLogged(page))
            {
                string ipAddress = GetIPAddress();
                if (ipAddress != "68.203.92.166")  // my development machine
                { 
                    using (HttpClient client = new HttpClient())
                    {
                        try
                        {
                            //AddPageHit(string ipAddress, string app, string page, string details)
                            string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];
                            HttpResponseMessage response = client.GetAsync(apiService + "/api/HitCounter/AddPageHit?ipAddress=" + ipAddress + "&app=Brucheum&page=" + page + "&details=" + details).Result;
                            string exists = response.Content.ReadAsStringAsync().Result;
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

        private static bool IsBeingLogged(string page)
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

        public static string GetIPAddress()
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

        public static string ErrorDetails(Exception ex)
        {
            var exceptionType = ex.GetBaseException();
            string msg = "ERROR: " + ex.Message;
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                msg = ex.Message;
            }
            return msg;
        }
    }
}