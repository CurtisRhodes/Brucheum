using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Runtime.Serialization.Formatters.Binary;
using System.Web;

namespace OggleBooble
{
    public static class Helpers
    {
        public static string GetAssemblyInfo(this Assembly assembly, TimeZoneInfo target = null)
        {
            Version version = Assembly.GetExecutingAssembly().GetName().Version;
            //DateTime buildDate = new DateTime(2000, 1, 1).AddDays(version.Build).AddSeconds(version.Revision * 2);

            var filePath = assembly.Location;
            const int c_PeHeaderOffset = 60;
            const int c_LinkerTimestampOffset = 8;

            var buffer = new byte[2048];

            using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
                stream.Read(buffer, 0, 2048);

            var offset = BitConverter.ToInt32(buffer, c_PeHeaderOffset);
            var secondsSince1970 = BitConverter.ToInt32(buffer, offset + c_LinkerTimestampOffset);
            var epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            var linkTimeUtc = epoch.AddSeconds(secondsSince1970);

            var tz = target ?? TimeZoneInfo.Local;
            var lastBuildTime = TimeZoneInfo.ConvertTimeFromUtc(linkTimeUtc, tz);

            return "build: " + version + "  " + lastBuildTime;
        }

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

        public static void LogPageHit(string page, string details)
        {
            //if (IsBeingLogged(page))
            {
                string ipAddress = GetIPAddress();
                //if (ipAddress != "68.203.92.166")  // my development machine
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
            string address = "no access";
            try
            {
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

                }
            }
            catch (Exception ex)
            {
                address = Helpers.ErrorDetails(ex);
            }
            return address;
        }

        public static string ErrorDetails(Exception ex)
        {
            //var exceptionType = ex.GetBaseException();
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