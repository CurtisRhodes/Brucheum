using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime.Serialization.Formatters.Binary;
using System.Web;

namespace Brucheum
{
    public class HitCounter
    {
        public static string SessionStartHit()
        {
            var success = "onNo";
            try
            {
                string ipAddress = GetIPAddress();
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
                        if (!success.StartsWith("ERROR"))
                        {
                            Console.Write(success);
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
            string ipAddress = GetIPAddress();
            //if (ipAddress != "68.203.92.166")
            { // my development machine
                if (IsBeingLogged(page))
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
                    allow = false;
                    break;
                case "/Book/MyBooks":
                case "/Article/Article":
                case "/Book/TableOfContents":
                case "/Consulting/ConsultingHome":
                case "/Book/Read":
                case "/Login/DeleteCookie":
                case "/Article/ArticleEdit":
                case "/Article/ArticleList":
                    allow = true;
                    break;
                default:
                    Console.Write("Page Not handled: " + page);
                    break;
            }
            return allow;
        }

        private static string GetIPAddress()
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