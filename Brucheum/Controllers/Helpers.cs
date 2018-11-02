using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Runtime.Serialization.Formatters.Binary;
using System.Threading.Tasks;
using System.Web;

namespace Brucheum
{
    public class Helpers
    {
        private static readonly string ipAddress = GetIPAddress();
        private static readonly string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];

        public static async Task<HttpResponseMessage> SessionStart()
        {
            using (HttpClient client = new HttpClient())
            {
                HttpResponseMessage response = await client.GetAsync(apiService + "/api/HitCounter/Verify?ipAddress=" + ipAddress + "&app=Brucheum", HttpCompletionOption.ResponseContentRead);
                //string exists = await response.Content.ReadAsStringAsync();
                //if (exists == "false")
                //{
                //    // WE HAVE A NEW VISITOR
                //    var AddVisitorResponseMessage = await client.GetAsync(apiService + "/api/HitCounter/AddVisitor?ipAddress=" + ipAddress + "&app=Brucheum&userId=duh", HttpCompletionOption.ResponseContentRead);
                //    string success = await response.Content.ReadAsStringAsync();
                //    await SendEmail("CONGRATULATIONS: someone just visited your site", "ip: " + ipAddress + " visited: The Brucheum");
                //}
                return response;
            }
        }

        public static async Task<string> SendEmail(string subjectLine, string message)
        {
            string success = "";
            using (HttpClient client = new HttpClient())
            {
                var responseMessage = await client.GetAsync(apiService + "/api/Email/SendEmail?subjectLine=" + subjectLine + "&message=" + message, HttpCompletionOption.ResponseContentRead);
                if (responseMessage.IsSuccessStatusCode)
                    success = "ok";
                else
                    success = responseMessage.ReasonPhrase;
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
                            string success = response.Content.ReadAsStringAsync().Result;
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