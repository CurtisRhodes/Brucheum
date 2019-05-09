using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.IO;
using System.Linq;
using System.Net;
using WebApi.DataContext;

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

        public static string GetParentPath(int folderId, bool withoutRoot)
        {
            string parentPath = "";
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                //var thisFolder = db.ImageFolders.Where(f => f.Id == folderId).First();
                //parentPath = thisFolder.FolderName;
                int parentId = db.CategoryFolders.Where(f => f.Id == folderId).Select(f => f.Parent).First();
                while (parentId > 1)
                {
                    var parentDb = db.CategoryFolders.Where(f => f.Id == parentId).First();
                    parentPath = parentDb.FolderName + "/" + parentPath;
                    parentId = parentDb.Parent;
                }
            }
            if (withoutRoot)
                return parentPath.Substring(parentPath.IndexOf("/") + 1);
            else
                return parentPath;
        }

        public static int GetModelId(int folderId)
        {
            int modelId = 0;
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                NudeModelInfo info = db.NudeModelInfos.Where(n => n.FolderId == folderId).FirstOrDefault();
                if (info == null)
                {
                    int parent = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault().Parent;
                    info = db.NudeModelInfos.Where(n => n.FolderId == parent).FirstOrDefault();
                    if (info == null)
                    {
                        parent = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault().Parent;
                        info = db.NudeModelInfos.Where(n => n.FolderId == parent).FirstOrDefault();
                        if (info != null)
                            modelId = info.ModelId;
                    }
                    else
                        modelId = info.ModelId;
                }
                else
                    modelId = info.ModelId;
            }
            return modelId;
        }
    }
}