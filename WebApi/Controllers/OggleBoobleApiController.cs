using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Directory.Models;
using WebApi.OggleBooble.DataContext;

namespace WebApi.OggleBooble
{

    [EnableCors("*", "*", "*")]
    public class FilesController : ApiController
    {
        [HttpGet]
        public List<FileModel> GetFiles(string folderPath)
        {
            string fullFolderPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/" + folderPath);
            FileInfo[] files = new DirectoryInfo(fullFolderPath).GetFiles();
            List<FileModel> images = new List<FileModel>();
            foreach (FileInfo img in files)
            {
                if (img.Extension != ".db")
                {
                    images.Add(new FileModel()
                    {
                        FileName = img.Name,
                        Length = img.Length,
                        Created = img.CreationTime,
                        Extension = img.Extension,
                        FullName = img.FullName
                    });
                }
            }
            return images;
        }
    }

    [EnableCors("*", "*", "*")]
    public class DirectoryController : ApiController
    {
        bool cancel = false;
        int imagesPerPage = 30;

        private string GetFirstImage(DirectoryInfo dir)
        {
            string firstImage = string.Empty;
            foreach (FileInfo file in dir.GetFiles())
            {
                if (file.Extension != ".db")
                {
                    firstImage = file.Name;
                    break;
                }
            }
            if (firstImage == string.Empty)
            {
                foreach (DirectoryInfo subDirectory in dir.GetDirectories())
                {
                    if (firstImage != string.Empty) break;
                    foreach (FileInfo file in subDirectory.GetFiles())
                    {
                        if (file.Extension != ".db")
                        {
                            firstImage = subDirectory.Name + "/" + file.Name;
                            break;
                        }
                    }
                    if (firstImage == string.Empty)
                    {
                        var dirRoot = subDirectory.Name + "/";
                        foreach (DirectoryInfo subSubDirectory in subDirectory.GetDirectories())
                        {
                            if (firstImage != string.Empty) break;
                            foreach (FileInfo file in subSubDirectory.GetFiles())
                            {
                                if (file.Extension != ".db")
                                {
                                    firstImage = dirRoot + subSubDirectory.Name + "/" + file.Name;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            if (firstImage == string.Empty)
            {
                GetFirstImageRecurr(dir);
            }
            return firstImage;
        }

        private string GetFirstImageRecurr(DirectoryInfo dir)
        {
            string firstImage = string.Empty;

            return firstImage;
        }




        [HttpGet]
        public List<FolderModel> GetSubdirectories(string parentFolder)
        {
            List<FolderModel> subDirectories = new List<FolderModel>();
            string fullFolderPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/" + parentFolder);
            DirectoryInfo[] directories = new DirectoryInfo(fullFolderPath).GetDirectories();
            foreach (DirectoryInfo dir in directories)
            { 
                var danniPath = "";
                var pparent = dir.Parent;
                while (pparent.Name != "Danni")
                {
                    danniPath = pparent.Name + "/" + danniPath;
                    pparent = pparent.Parent;
                }
                danniPath += dir.Name;

                subDirectories.Add(new FolderModel()
                {
                    DirectoryName = dir.Name,
                    Created = dir.CreationTime,
                    DanniPath = danniPath,
                    Path = dir.FullName,
                    Parent = dir.Parent.Name,
                    FirstImage = GetFirstImage(dir)
                });
            }
            return subDirectories;
        }

        //public double ImageCount(string folder)
        //{
        //    string danni = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/" + folder);
        //    double len = Math.Floor((double)(new DirectoryInfo(danni).GetFiles().Length / imagesPerPage));
        //    return len;
        //}




        [HttpPost]
        public string WriteFileList()
        {
            string success = "ono";
            cancel = false;
            try
            {
                string danni = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni");
                using (OggleBoobleContext db = new OggleBoobleContext())
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

        public void ProcessDir(OggleBoobleContext db, DirectoryInfo dir, int parent)
        {
            var folderId = AddDirToDb(db, dir, parent);
            AddFilesToDb(db, dir, folderId);
            DirectoryInfo[] dirs = dir.GetDirectories();
            foreach (DirectoryInfo subDir in dirs)
            {
                if (cancel)
                    break;
                ProcessDir(db, subDir, folderId);
            }
        }

        private int AddDirToDb(OggleBoobleContext db, DirectoryInfo di, int parent)
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

        private void AddFilesToDb(OggleBoobleContext db, DirectoryInfo di, int folderId)
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

        private string GetSubDirs(DirectoryInfo childDir, string folder, string thisService)
        {
            var sb = new StringBuilder();
            string defaultImage;

            if (childDir.GetFiles().Length > 0)
            {
                defaultImage = thisService + "/App_Data/Danni/" + folder + "/" + childDir.GetFiles("*.jpg")[0].Name;

                sb.Append("<div class='galleryfolder'><a href='/Home/ImagePage?folder=" + folder + "/" + childDir.Name +
                    "'><img class='galleryImage' src='" + defaultImage + "' alt='check out " + childDir.Name +
                    " gallery' /></a><div class='galleryLabel'><a href='/Home/ImagePage?folder=" + folder + "/" + childDir.Name + "'>" + childDir.Name + "</a></div></div>");
            }
            if (childDir.GetDirectories().Length > 0)
            {
                foreach (DirectoryInfo subdir in childDir.GetDirectories())
                {
                    if (subdir.Name != "thumbnails")
                    {
                        string danni = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/" + folder + "/" + subdir.Name);
                        DirectoryInfo deepDir = new DirectoryInfo(danni);
                        //sb.Append(GetSubDirs(deepDir, folder + "/" + childDir.Name + "/" + subdir.Name, thisService));
                        sb.Append(GetSubDirs(deepDir, folder + "/" + subdir.Name, thisService));
                    }
                }
            }

            return sb.ToString();
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
                    if ((childDir.GetFiles().Length > 0) && (childDir.GetFiles("*.jpg").Length > 0))
                    {
                        defaultImage = thisService + "/App_Data/Danni/" + folder + "/" + childDir.Name + "/" + childDir.GetFiles("*.jpg")[0].Name;
                        sb.Append("<div class='galleryfolder'><a href='/Home/ImagePage?folder=" + folder + "/" + childDir.Name +
                            "'><img class='galleryImage' src='" + defaultImage + "' alt='check out " + childDir.Name +
                            " gallery' /></a><div class='galleryLabel'><a href='/Home/ImagePage?folder=" + folder + "/" + childDir.Name + "'>" + childDir.Name + "</a></div></div>");
                    }
                    else
                    {
                        if ((childDir.GetDirectories()[0].GetFiles().Length > 0) && (childDir.GetDirectories()[0].GetFiles("*.jpg")[0].Length > 0))
                        {
                            defaultImage = thisService + "/App_Data/Danni/" + folder + "/" + childDir.Name + "/" +
                                childDir.GetDirectories()[0].Name + "/" + childDir.GetDirectories()[0].GetFiles("*.jpg")[0].Name;
                        }
                        else if ((childDir.GetDirectories()[0].GetDirectories()[0].GetFiles().Length > 0)
                            && (childDir.GetDirectories()[0].GetDirectories()[0].GetFiles("*.jpg")[0].Length > 0))
                        {
                            defaultImage = thisService + "/App_Data/Danni/" + folder + "/" +
                                childDir.GetDirectories()[0].GetDirectories()[0].Name + "/" + childDir.GetDirectories()[0].GetDirectories()[0].GetFiles("*.jpg")[0].Name;
                        }
                        else
                        {
                            defaultImage = thisService + "/App_Data/Danni/danni.jpg";
                        }
                        sb.Append("<div class='galleryfolder'><a href='/Home/Gallery?folder=" + folder + "/" + childDir.Name +
                            "'><img class='galleryImage' src='" + defaultImage + "' alt='check out " + childDir.Name +
                            " gallery' /></a><div class='galleryLabel'><a href='/Home/gallery?folder=" + folder + "/" + childDir.Name + "'>" + childDir.Name + "</a></div></div>");
                    }
                }
                //if (childDir.GetDirectories().Length > 0)
                //{
                //    foreach (DirectoryInfo subdir in childDir.GetDirectories())
                //    {
                //        if (subdir.Name != "thumbnails")
                //        {
                //            string doubleDanni = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/" + folder + "/" + childDir.Name + "/" + subdir.Name);
                //            DirectoryInfo deepDir = new DirectoryInfo(doubleDanni);
                //            sb.Append(GetSubDirs(deepDir, folder + "/" + childDir.Name + "/" + subdir.Name, thisService));
                //        }
                //    }
                //}
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
                DirectoryInfo[] subDirs = di.GetDirectories();
                if (subDirs.Length > 0)
                {
                    foreach (DirectoryInfo childDir in subDirs)
                    {
                        if ((childDir.GetFiles().Length > 0) && (childDir.GetFiles("*.jpg").Length > 0))
                        {
                            //var defaultImage = thisService + "/App_Data/Danni/" + folder + "/" + childDir.Name + "/" + childDir.GetFiles("*.jpg")[0].Name;
                            //sb.Append("<div class='divImage'><a href='/Home/ImagePage?folder=" + folder + "/" + childDir.Name +
                            //    "'><img class='thumbImage' src='" + defaultImage + "' alt='check out " + childDir.Name +
                            //    " gallery' /></a><div class='galleryLabel'><a href='/Home/ImagePage?folder=" + folder + "/" + childDir.Name + "'>" + childDir.Name + "</a></div></div>");
                        }
                    }

                }
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
                    if (count >= (start + imagesPerPage))
                    {
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
        public string[] TabStrip(string folder, string thisService, string startImage)
        {
            var images = new List<string>();
            try
            {
                string danni = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/" + folder);
                FileInfo[] files = new DirectoryInfo(danni).GetFiles();
                for (int i = 0; i < files.Count(); i++)
                {
                    if (files[i].Name != "thumbs.db")
                    {
                        //$('#tabStripContentArea').append("<div class='tabImage'>" + imageArray[i] + "</div>");
                        images.Add("<img idx='" + i + "' src='" + thisService + "/App_Data/Danni/" + folder + "/" + files[i].Name + "'>");
                        //images.Add(thisService + "/App_Data/Danni/" + folder + "/" + file.Name);
                    }
                }
            }
            catch (Exception ex)
            {
                images.Add(ex.Message);
            }
            return images.ToArray();
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

    [EnableCors("*", "*", "*")]
    public class TransitionController : ApiController
    {
        [HttpGet]
        public string[] LoadPicArray()
        {
            string danni = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/boobs/transitions");
            FileInfo[] files = new DirectoryInfo(danni).GetFiles();
            List<string> images = new List<string>();
            foreach (FileInfo img in files)
                images.Add(img.Name);
            return images.ToArray();
        }
    }
}