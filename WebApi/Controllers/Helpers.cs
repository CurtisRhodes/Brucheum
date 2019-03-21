﻿using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Directory.Models;
using WebApi.OggleBooble.DataContext;

namespace WebApi
{
    public class Helpers
    {
        public static string ErrorDetails(Exception ex)
        {
            string msg = "ERROR: " + ex.Message;
            if (ex.GetType() == typeof(DbEntityValidationException))
            {
                var ee = (DbEntityValidationException)ex;
                foreach (DbEntityValidationResult eve in ee.EntityValidationErrors)
                {
                    msg += string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:", eve.Entry.Entity.GetType().Name, eve.Entry.State);
                    foreach (var dbe in eve.ValidationErrors)
                    {
                        msg += string.Format("- Property: \"{0}\", Error: \"{1}\"", dbe.PropertyName, dbe.ErrorMessage);
                    }
                }
            }
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                msg = "ERROR: " + ex.Message;
            }
            return msg;
        }

        //public static string SendEmail(string subjectLine, string message)
        //{
        //    string success = "";
        //    try
        //    {
        //        SmtpClient smtp = new SmtpClient("relay-hosting.secureserver.net", 25);
        //        MailMessage mailMessage = new MailMessage("info@curtisrhodes.com", "Curtishrhodes@hotmail.com");
        //        mailMessage.Subject = subjectLine;
        //        mailMessage.Body = message;
        //        smtp.Send(mailMessage);
        //        success = "ok";
        //    }
        //    catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
        //    return success;
        //}

        public static string DateName(string dateMonth)
        {
            switch (dateMonth)
            {
                case "1": return "Jan";
                case "2": return "Feb";
                case "3": return "Mar";
                case "4": return "April";
                case "5": return "May";
                case "6": return "June";
                case "7": return "July";
                case "8": return "Aug";
                case "9": return "Sept";
                case "10": return "Oct";
                case "11": return "Nov";
                case "12": return "Dec";
                default: return dateMonth;
            }
        }

        private static Random random = new Random();
        public string GetRandomString(int length = 12)
        {
            const string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            return new string(Enumerable.Repeat(chars, length)
              .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        public static void SendProgress(string progressMessage, int progressCount, int totalItems)
        {
            Microsoft.AspNet.SignalR.IHubContext hubContext = Microsoft.AspNet.SignalR.GlobalHost.ConnectionManager.GetHubContext<ProgressHub>();
            hubContext.Clients.All.addProgress(progressMessage, progressCount, totalItems);

            //var percentage = 0;
            //if (totalItems > 0)
            //    percentage = (progressCount * 100) / totalItems;
            //hubContext.Clients.All.AddProgress(progressMessage, percentage + "%");

        }
    }


    [EnableCors("*", "*", "*")]
    public class DirectoryController : System.Web.Http.ApiController
    {
        [HttpGet]
        public ImageCategoryModel DownloadRejects(int id)
        {
            var model = new ImageCategoryModel();
            try
            {

                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                   List<GoDaddyLink> orphans = db.GoDaddyLinks.Where(g => g.Id == g.Link).ToList();
                    //foreach(GoDaddyLink orphan in orphans)

                    //fileName = dbLink.FolderName + "_" + dbLink.LinkId + extension;
                    
                    //var dbImageCategories = db.ImageCategories.Where(f => f.Id == id).First();
                    //model.Id = dbImageCategories.Id;
                    //model.Parent = dbImageCategories.Parent;
                    //model.FolderName = dbImageCategories.FolderName;
                    //model.RootFolder = dbImageCategories.RootFolder;
                }
            }
            catch (Exception ex)
            {
                model.FolderName = Helpers.ErrorDetails(ex);
            }
            return model;
        }


    }


}