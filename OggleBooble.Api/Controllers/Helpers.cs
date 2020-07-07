using OggleBooble.Api.MySqlDataContext;
using OggleBooble.Api.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Data.Entity;

namespace OggleBooble.Api.Controllers
{
    public enum FolderAttributeCode
    {
        Title = 40091,
        Comment = 40092,
        UserComment = 37510,
        Author = 40093,
        Keywords = 40094,
        Subject = 40095,
        Copyright = 33432,
        Software = 11,
        ImageId = 32781,
        DateTime = 36867,
        SubjetLocation = 41492
    }
    public static class Helpers
    {
        public static string DetermineFolderType(FolderTypeModel folderTypeInfo)
        {
            if (folderTypeInfo.RootFolder == "centerfold")
            {
                return "singleModelCollection";
            }
            if (folderTypeInfo.HasImages && folderTypeInfo.HasSubFolders)
            {
                if (folderTypeInfo.ContainsRomanNumeral)
                    return "singleModelGallery";
                if (folderTypeInfo.ContainsNonRomanNumeralChildren)
                    return "assorterdImagesGallery";
            }
            if (folderTypeInfo.HasSubFolders && !folderTypeInfo.HasImages)
            {
                if (!folderTypeInfo.ContainsNonRomanNumeralChildren)
                    return "assorterdImagesGallery";

                if (folderTypeInfo.RootFolder == "archive" || folderTypeInfo.RootFolder == "sluts")
                    return "singleModelGallery";
                if (folderTypeInfo.RootFolder == "boobs" || folderTypeInfo.RootFolder == "porn")
                    return "assorterdImagesGallery";
            }
            if (folderTypeInfo.HasImages)
            {
                if (folderTypeInfo.RootFolder == "archive" || folderTypeInfo.RootFolder == "sluts")
                    return "singleModelCollection";
                else
                    return "assorterdImagesCollection";
            }

            //folderDetailModel.ContainsRomanNumerals = ContainsRomanNumerals(db.CategoryFolders.Where(f => f.Parent == folderId).ToList());
            //folderDetailModel.HasImages = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count() > 0;
            //folderDetailModel.HasSubfolders = db.CategoryFolders.Where(f => f.Parent == folderId).Count() > 0;
            return "unknown";
        }

        public static bool ContainsRomanNumeralChildren(List<string> childFolders)
        {
            foreach (string childFolder in childFolders)
            {
                if (childFolder.Contains(" I")) return true;
                if (childFolder.Contains(" V")) return true;
                if (childFolder.Contains(" X")) return true;
            }
            return false;
        }

        public static bool ContainsNonRomanNumeralChildren(List<string> childFolders)
        {

            foreach (string childFolder in childFolders)
            {
                if (!childFolder.Contains(" I") && childFolder.Contains(" V") && childFolder.Contains(" X")) {
                    return true;
                }
            }
            return false;
        }


        public static string GetFileUrlFromLinkId(string linkId)
        {
            string imgUrl = "";

            return imgUrl;
        }

        public static bool ContainsRomanNumeral(string folderName)
        {
            var doesContain = false;
            if (folderName.Contains(" I"))
                doesContain = true;
            if (folderName.Contains(" V"))
                doesContain = true;
            if (folderName.Contains(" X"))
                doesContain = true;
            return doesContain;
        }

        public static Image SetMetaValue(this Image image, FolderAttributeCode property, string value)
        {
            PropertyItem prop = image.PropertyItems[0];
            int iLen = value.Length + 1;
            byte[] bTxt = new Byte[iLen];
            for (int i = 0; i < iLen - 1; i++)
                bTxt[i] = (byte)value[i];
            bTxt[iLen - 1] = 0x00;
            prop.Id = (int)property;
            prop.Type = 2;
            prop.Value = bTxt;
            prop.Len = iLen;
            return image;
        }

        public static string GetMetaValue(this Image image, int propertyId)
        {
            PropertyItem[] propItems = image.PropertyItems;
            var prop = propItems.FirstOrDefault(p => p.Id == propertyId);
            if (prop != null)
            {
                return Encoding.UTF8.GetString(prop.Value);
            }
            else
            {
                return null;
            }
        }

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

        //private static Random random = new Random();
        //public string GetRandomString(int length = 12)
        //{
        //    const string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        //    return new string(Enumerable.Repeat(chars, length)
        //      .Select(s => s[random.Next(s.Length)]).ToArray());
        //}

        public static string Beautify(string stankyString)
        {
            return stankyString.Replace("'", "''")
                .Replace("&#10;", "");
            //.replace(/ &quot;/ g, "\"")
            //.replace(/ &#39;/g, "'")
            //.replace(/ &nbsp;/ g, " ")
            //.replace(/\n / g, "");
        }

        //public static string GetIPAddress()
        //{
        //    String address = "";
        //    WebRequest request = WebRequest.Create("http://checkip.dyndns.org/");
        //    using (WebResponse response = request.GetResponse())
        //    {
        //        using (StreamReader stream = new StreamReader(response.GetResponseStream()))
        //        {
        //            address = stream.ReadToEnd();
        //        }
        //        int first = address.IndexOf("Address: ") + 9;
        //        int last = address.LastIndexOf("</body>");
        //        address = address.Substring(first, last - first);

        //        return address;
        //    }
        //}

        public static bool IsNullorUndefined(string testValue)
        {
            bool isNullorUndefined = false;
            if (testValue == null)
                isNullorUndefined = true;
            if (testValue == "undefined")
                isNullorUndefined = true;
            if (testValue == "")
                isNullorUndefined = true;

            return isNullorUndefined;
        }


        public static string GetLocalParentPath(int folderId)
        {
            string parentPath = "";
            using (var db = new OggleBoobleMySqlContext())
            {
                //var thisFolder = db.ImageFolders.Where(f => f.Id == folderId).First();
                //parentPath = thisFolder.FolderName;
                int parentId = db.VirtualFolders.Where(f => f.Id == folderId).Select(f => f.Parent).First();
                while (parentId > 1)
                {
                    var parentDb = db.VirtualFolders.Where(f => f.Id == parentId).First();
                    parentPath = parentDb.FolderName + "/" + parentPath;
                    parentId = parentDb.Parent;
                }
            }
            return parentPath;
        }

        public static string GetFullParentPath(int folderId)
        {
            string parentPath = "";
            using (var db = new OggleBoobleMySqlContext())
            {
                var thisFolder = db.VirtualFolders.Where(f => f.Id == folderId).First();
                parentPath = ""; //thisFolder.FolderName;
                int parentId = thisFolder.Parent; // db.CategoryFolders.Where(f => f.Id == folderId).Select(f => f.Parent).First();
                while (parentId > 1)
                {
                    var parentDb = db.VirtualFolders.Where(f => f.Id == parentId).First();
                    //if (!parentDb.FolderName.Contains(".OGGLEBOOBLE.COM"))
                    //    parentPath = parentDb.FolderName + "/" + parentPath;
                    parentPath = parentDb.FolderName.Replace(".OGGLEBOOBLE.COM", "") + "/" + parentPath;
                    parentId = parentDb.Parent;
                }
            }
            return parentPath;
        }

        public static string GetParentPath(int folderId)
        {
            string parentPath = "";
            using (var db = new OggleBoobleMySqlContext())
            {
                var thisFolder = db.VirtualFolders.Where(f => f.Id == folderId).First();
                parentPath = ""; //thisFolder.FolderName;
                int parentId = thisFolder.Parent; // db.CategoryFolders.Where(f => f.Id == folderId).Select(f => f.Parent).First();
                while (parentId > 1)
                {
                    var parentDb = db.VirtualFolders.Where(f => f.Id == parentId).First();
                    //if (!parentDb.FolderName.Contains(".OGGLEBOOBLE.COM"))
                    //    parentPath = parentDb.FolderName + "/" + parentPath;
                    parentPath = parentDb.FolderName.Replace(".OGGLEBOOBLE.COM", "") + "/" + parentPath;
                    parentId = parentDb.Parent;
                }
            }

            var test = parentPath;
            var test2 = parentPath.Substring(parentPath.IndexOf("/") + 1);

            return parentPath.Substring(parentPath.IndexOf("/") + 1);
        }
    }
}