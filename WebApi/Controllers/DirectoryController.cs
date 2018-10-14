using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Service1.Controllers
{
    [EnableCors("*", "*", "*")]
    public class DirectoryController : ApiController
    {
        bool cancel = false;
        int imagesPerPage = 30;

        [HttpGet]
        public string get()
        {
            string success = "ono";
            cancel = false;
            try
            {
                string danni = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni");
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    DirectoryInfo rootDI = new DirectoryInfo(danni);
                    DirectoryInfo[] dirs = rootDI.GetDirectories();
                    var rootFolderId = AddDirToDb(db, rootDI, 0);
                    AddFilesToDb(db, rootDI, rootFolderId);
                    foreach (DirectoryInfo dir in dirs)
                    {
                        ProcessDir(db, dir, rootFolderId);
                    }
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    success = e.InnerException.Message;
                    if (e.InnerException.InnerException != null)
                        success += " :" + e.InnerException.InnerException.Message;
                }
                else
                    success = e.Message;
            }
            return success;
        }

        public void Cancel()
        {
            cancel = true;
        }

        public void ProcessDir(GoDaddyContext db, DirectoryInfo dir, int parent)
        {
            var folderId = AddDirToDb(db, dir, parent);
            AddFilesToDb(db, dir,folderId);
            DirectoryInfo[] dirs = dir.GetDirectories();
            foreach (DirectoryInfo subDir in dirs)
            {
                if (cancel)
                    break;
                ProcessDir(db, subDir, folderId);
            }
        }

        private int AddDirToDb(GoDaddyContext db, DirectoryInfo di, int parent)
        {
            var row = new ImageFolder()
            {
                FolderName = di.Name,
                RelativePath = di.FullName,                 
                ParentFolderId = parent
            };
            db.ImageFolders.Add(row);
            db.SaveChanges();
            return row.FolderId;
        }

        private void AddFilesToDb(GoDaddyContext db, DirectoryInfo di, int folderId)
        {
            FileInfo[] files = di.GetFiles();
            foreach (FileInfo file in files)
            {
                var row = new ImageFile();
                row.ImageId = Guid.NewGuid();
                row.FolderId = folderId;
                row.FolderName = di.Name;
                row.ImageName = file.Name + "." + file.Extension;
                row.Size = file.Length;
                db.ImageFiles.Add(row);
            }
            db.SaveChanges();
        }

        [HttpGet]
        public string GalleryPage(string folder, string thisService)
        {
            var sb = new StringBuilder();
            try
            {
                //string xx= HttpServer.n
                string defaultImage;
                string danni = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/" + folder);
                DirectoryInfo di = new DirectoryInfo(danni);

                DirectoryInfo[] folders = di.GetDirectories();
                foreach (DirectoryInfo childDir in folders)
                {
                    //s = folder.Replace(" ", "%20") + "/" + childDir.Name.Replace(" ", "%20");
                    defaultImage = thisService+ "/App_Data/Danni/"+ folder + "/" + childDir.Name + "/" + childDir.GetFiles("*.jpg")[0].Name;

                    sb.Append("<div class='galleryfolder'><a href='/Home/ImagePage?folder=" + folder + "/" + childDir.Name +
                        "'><img class='galleryImage' src='" + defaultImage + "' alt='check out " + childDir.Name +
                        " gallery' /></a><div class='galleryLabel'><a href='/Home/ImagePage?folder=" + folder + "/" + childDir.Name + "'>" + childDir.Name + "</a></div></div>");
                }
            }
            catch (Exception ex)
            {
                sb.Clear();
                if (ex.InnerException != null)
                {
                    sb.Append(ex.InnerException.Message);
                    if (ex.InnerException.InnerException != null)
                        sb.Append(" :" + ex.InnerException.InnerException.Message);
                }
                else
                    sb.Append(ex.Message);
            }
            return sb.ToString();
        }

        [HttpGet]
        public string ImagePage(string folder, string thisService, int page)
        {
            var sb = new StringBuilder();
            try
            {
                string danni = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/" + folder);
                string imageFile;
                int count = 0;
                int start = page * imagesPerPage;

                DirectoryInfo di = new DirectoryInfo(danni);
                FileInfo[] files = di.GetFiles();
                int max = files.Length;
                foreach (FileInfo file in files)
                {
                    count++;
                    if (count > start)
                    {
                        imageFile = thisService + "/App_Data/Danni/" + folder + "/" + file.Name;
                        sb.Append("<div class='divImage'><a href='/Home/Viewer?folder=" + folder + "&startFile=" + file.Name + 
                            "'><img class='thumbImage' src='" + imageFile + "'</a></div>");
                    }
                    if (count >= (start + imagesPerPage)) {
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                sb.Clear();
                if (ex.InnerException != null)
                {
                    sb.Append(ex.InnerException.Message);
                    if (ex.InnerException.InnerException != null)
                        sb.Append(" :" + ex.InnerException.InnerException.Message);
                }
                else
                    sb.Append(ex.Message);
            }
            return sb.ToString();
        }

        [HttpGet]
        public double ImageCount(string folder)
        {
            string danni = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/" + folder);
            double len = Math.Floor((double)(new DirectoryInfo(danni).GetFiles().Length / imagesPerPage));
            return len;
        }



        // POST: api/Directory
        public void Post([FromBody]string value)
        {
        }

        // PUT: api/Directory/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/Directory/5
        public void Delete(int id)
        {
        }
    }
}
