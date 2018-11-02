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
using Microsoft.AspNet.Identity.Owin;
using System.Web.Mvc;
using Brucheum.Models;

namespace Brucheum
{
    public class Helpers : Controller
    {
        private static readonly string ipAddress = GetIPAddress();
        private static readonly string apiService = System.Configuration.ConfigurationManager.AppSettings["apiService"];
        private static ApplicationUserManager _userManager;

        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }

        public static async Task<HttpResponseMessage> SessionStart()
        {
            using (HttpClient client = new HttpClient())
            {
                HttpResponseMessage response = await client.GetAsync(apiService + "/api/HitCounter/LogVisit?ipAddress=" + ipAddress + "&app=Brucheum", HttpCompletionOption.ResponseContentRead);
                return response;
            }
        }

        public static void PageHit(string page, string details)
        {
            if (ipAddress != "68.203.92.166")  // my development machine
            {
                if (IsBeingLogged(page))
                {
                    using (HttpClient client = new HttpClient())
                    {
                        try
                        {
                            HttpResponseMessage response = client.GetAsync(apiService + "/api/HitCounter/AddPageHit?ipAddress=" + ipAddress + "&app=Brucheum&page=" + page + "&details=" + details).Result;
                            //string success = response.Content.ReadAsStringAsync().Result;
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

        public static bool IsInRole()
        {
            bool isInRole = false;

            //var x = new User.i

            //if (User.Identity.IsAuthenticated)
            //    isInRole = true;

            return isInRole;
        }


        private static bool IsBeingLogged(string page)
        {
            bool allow = false;
            switch (page)
            {
                case "/":
                case "/Article/ArticleList":
                case "/Login/LoginPopup":
                case "/Login/RegisterPopup":
                    allow = false;
                    break;
                case "/Home/Index":
                case "/Book/MyBooks":
                case "/Article/Article":
                case "/Book/TableOfContents":
                case "/Consulting/ConsultingHome":
                case "/Book/Read":
                case "/Login/DeleteCookie":
                case "/Article/ArticleEdit":
                case "/Login/Login":
                case "/Login/Logout":
                case "/Login/Register":
                case "/Login/ProfilePopup":
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
            //if(ex.GetBaseException)
            //msg + 
            //catch (DbEntityValidationException ve)
            //{
            //    success = "ERROR: ";
            //    foreach (DbEntityValidationResult e in ve.EntityValidationErrors)
            //    {
            //        foreach (var eve in ve.EntityValidationErrors)
            //        {
            //            //Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:", eve.Entry.Entity.GetType().Name, eve.Entry.State);
            //            success += string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:", eve.Entry.Entity.GetType().Name, eve.Entry.State);
            //            foreach (var dbe in eve.ValidationErrors)
            //            {
            //                //Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"", dbe.PropertyName, dbe.ErrorMessage);
            //                success += string.Format("- Property: \"{0}\", Error: \"{1}\"", dbe.PropertyName, dbe.ErrorMessage);
            //            }
            //        }
            //    }
            //}
            ////catch (System.Data.SqlClient.SqlErrorCollection. eee)
            //{ }

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

    }
}