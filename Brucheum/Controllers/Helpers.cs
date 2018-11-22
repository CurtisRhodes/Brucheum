using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace Brucheum
{
    public class Helpers
    {
        private static readonly string ipAddress = GetIPAddress();
        private static readonly string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];

        //public static async Task<string> SessionStart()
        //{
        //    ThrowError("email not working");

        //    string success = "";
        //    try
        //    {
        //        using (HttpClient client = new HttpClient())
        //        {

        //            // , HttpCompletionOption.ResponseContentRead
        //            //HttpResponseMessage response = await client.GetAsync(apiService + "/api/HitCounter/LogVisit?ipAddress=" + ipAddress + "&app=Brucheum");

        //            //string content = await response.Content.ReadAsStringAsync();

        //            //var scode = response.IsSuccessStatusCode;
        //            //var rp = response.ReasonPhrase;
        //            //HttpContent xx = response.Content;
        //            //string bbb = xx.ReadAsStringAsync().Result;


        //            //if (response.IsSuccessStatusCode)
        //            //{
        //            //    var x = response.ReasonPhrase;
        //            //}


        //            ////success = await response.Content.ReadAsStringAsync();
        //            //if (success != "ok")
        //            //{
        //            //    ThrowError(success);
        //            //}

        //            //if (exists == "false")
        //            //{
        //            //    // WE HAVE A NEW VISITOR
        //            //    var AddVisitorResponseMessage = await client.GetAsync(apiService + "/api/HitCounter/AddVisitor?ipAddress=" + ipAddress + "&app=Brucheum&userId=duh", HttpCompletionOption.ResponseContentRead);
        //            //    string success = await response.Content.ReadAsStringAsync();
        //            //    await SendEmail("CONGRATULATIONS: someone just visited your site", "ip: " + ipAddress + " visited: The Brucheum");
        //            //}
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        ThrowError(ErrorDetails(ex));
        //    }
        //    return success;
        //}

        public static async Task<string> PageHit(string page, string details)
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
                            HttpResponseMessage response = await client.GetAsync(apiService +
                                "/api/HitCounter/AddPageHit?ipAddress=" + ipAddress + "&app=Brucheum&page=" + page + "&details=" + details);
                            string success = await response.Content.ReadAsStringAsync();
                            if (success != "ok") {
                                ThrowError(success);
                            }
                        }
                        catch (Exception ex)
                        {
                            ThrowError(ErrorDetails(ex));
                        }
                    }
                }
            }
            return "Whatever";
        }

        public static void ThrowError(string errMessage )
        {
            new LoginController().ShowCustomMessage(errMessage);
        }

        private static bool IsBeingLogged(string page)
        {
            bool allow = false;
            switch (page)
            {
                case "/":
                case "/Admin":
                case "/Admin/GetUsers":
                case "/Admin/GetAllRoles":
                    allow = false;
                    break;
                case "/Book/MyBooks":
                case "/Article/Article":
                case "/Book/TableOfContents":
                case "/IntelDsgn/IntelDsgnHome":
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