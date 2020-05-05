using OggleBooble.Api.Models;
using OggleBooble.Api.MsSqlDataContext;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace OggleBooble.Api.Controllers
{
    public class OggleFileController : ApiController
    {
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];

        [HttpPut]
        [Route("api/OggleFile/MoveCopyArchive")]
        public SuccessModel MoveCopyArchive(MoveCopyImageModel model)
        {
            SuccessModel successModel = new SuccessModel();
            try
            {
                if (model.SourceFolderId == model.DestinationFolderId)
                {
                    successModel.Success = "Source and Destination the same";
                    return successModel;
                }

                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    ImageLink dbImageLink = db.ImageLinks.Where(l => l.Link.Replace("%20", " ") == model.Link.Replace("%20", " ")).FirstOrDefault();
                    if (dbImageLink == null)
                    {
                        successModel.Success = "link [" + model.Link.Replace("%20", " ") + "] not found";
                        return successModel;
                    }
                    List<CategoryImageLink> categoryImageLinks = db.CategoryImageLinks.Where(l => l.ImageCategoryId == model.DestinationFolderId).ToList();
                    if (model.Mode == "Copy")
                    {
                        CategoryImageLink existingLink = categoryImageLinks.Where(l => l.ImageLinkId == dbImageLink.Id).FirstOrDefault();
                        if (existingLink != null)
                            successModel.Success = "Link already exists";
                        else
                        {
                            db.CategoryImageLinks.Add(new CategoryImageLink()
                            {
                                ImageCategoryId = model.DestinationFolderId,
                                ImageLinkId = dbImageLink.Id,
                                SortOrder = 999
                            });
                            db.SaveChanges();
                            successModel.Success = "ok";
                        }
                    }
                    else  // Archive / Move
                    {
                        CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == model.SourceFolderId).First();
                        string linkId = model.Link.Substring(model.Link.LastIndexOf("_") + 1, 36);
                        ImageLink imageLink = db.ImageLinks.Where(i => i.Id == linkId).FirstOrDefault();
                        if (imageLink == null)
                        {
                            successModel.Success = "ImageLink record not found";
                            return successModel;
                        }

                        CategoryFolder dbDestinationFolder = db.CategoryFolders.Where(f => f.Id == model.DestinationFolderId).First();
                        string extension = model.Link.Substring(model.Link.LastIndexOf("."));
                        string destinationFtpPath = ftpHost + dbDestinationFolder.RootFolder + ".ogglebooble.com/" + Helpers.GetParentPath(model.DestinationFolderId) + dbDestinationFolder.FolderName;
                        string sourceFtpPath = ftpHost + dbSourceFolder.RootFolder + ".ogglebooble.com/" + Helpers.GetParentPath(model.SourceFolderId) + dbSourceFolder.FolderName;
                        string newFileName = dbDestinationFolder.FolderName + "_" + dbImageLink.Id + extension;
                        string sourceFileName = model.Link.Substring(model.Link.LastIndexOf("/") + 1);

                        if (!FtpUtilies.DirectoryExists(destinationFtpPath))
                            FtpUtilies.CreateDirectory(destinationFtpPath);

                        string ftpMoveSuccess = FtpUtilies.MoveFile(sourceFtpPath + "/" + sourceFileName, destinationFtpPath + "/" + newFileName);
                        if (ftpMoveSuccess == "ok")
                        {
                            #region move file on local drive 
                            string localDestinationPath = "";
                            try
                            {
                                string localServerPath = "F:/Danni/";
                                string localSourcePath = localServerPath + Helpers.GetLocalParentPath(model.SourceFolderId) + dbSourceFolder.FolderName + "/" + dbSourceFolder.FolderName + "_" + dbImageLink.Id + extension;
                                localDestinationPath = localServerPath + Helpers.GetLocalParentPath(model.DestinationFolderId) + dbDestinationFolder.FolderName;
                                FileInfo localFile = new FileInfo(localSourcePath);
                                DirectoryInfo directoryInfo = new DirectoryInfo(localDestinationPath);
                                if (!directoryInfo.Exists)
                                    directoryInfo.Create();
                                localFile.MoveTo(localDestinationPath + "/" + newFileName);
                            }
                            catch (Exception ex)
                            {
                                System.Diagnostics.Debug.WriteLine("move file on local drive : " + Helpers.ErrorDetails(ex) + " " + localDestinationPath);
                            }
                            #endregion

                            //2. update ImageLinks 
                            string linkPrefix = "http://" + dbDestinationFolder.RootFolder + ".ogglebooble.com/";
                            string newInternalLink = linkPrefix + Helpers.GetParentPath(model.DestinationFolderId) + dbDestinationFolder.FolderName + "/" + newFileName;
                            #region do it for sql server

                            ImageLink goDaddyrow = db.ImageLinks.Where(g => g.Id == dbImageLink.Id).FirstOrDefault();
                            if (goDaddyrow != null)
                            {
                                goDaddyrow.Link = newInternalLink;
                                goDaddyrow.FolderLocation = dbDestinationFolder.Id;
                            }
                            else
                                Console.WriteLine("imageLink.FolderLocation() != categoryFolder.Id()");
                            CategoryImageLink oldCatImageLink = db.CategoryImageLinks
                                 .Where(c => c.ImageCategoryId == model.SourceFolderId && c.ImageLinkId == dbImageLink.Id).First();
                            db.CategoryImageLinks.Add(new CategoryImageLink()
                            {
                                ImageCategoryId = model.DestinationFolderId,
                                ImageLinkId = dbImageLink.Id,
                                SortOrder = oldCatImageLink.SortOrder
                            });
                            db.SaveChanges();
                            if (model.Mode == "Move")
                            {
                                db.CategoryImageLinks.Remove(oldCatImageLink);
                            }
                            db.SaveChanges();
                            #endregion

                            #region do it for my sql
                            using (var mdb = new MySqlDataContext.OggleBoobleMySqContext())
                            {
                                MySqlDataContext.ImageLink mdbImageLink = mdb.ImageLinks.Where(g => g.Id == dbImageLink.Id).FirstOrDefault();
                                if (mdbImageLink != null)
                                {
                                    mdbImageLink.Link = newInternalLink;
                                    mdbImageLink.FolderLocation = dbDestinationFolder.Id;
                                }
                                else
                                    Console.WriteLine("imageLink.FolderLocation() != categoryFolder.Id()");
                                MySqlDataContext.CategoryImageLink oldMdbCatImageLink = mdb.CategoryImageLinks
                                     .Where(c => c.ImageCategoryId == model.SourceFolderId && c.ImageLinkId == dbImageLink.Id).First();
                                mdb.CategoryImageLinks.Add(new MySqlDataContext.CategoryImageLink()
                                {
                                    ImageCategoryId = model.DestinationFolderId,
                                    ImageLinkId = dbImageLink.Id,
                                    SortOrder = oldMdbCatImageLink.SortOrder
                                });
                                db.SaveChanges();
                                if (model.Mode == "Move")
                                {
                                    db.CategoryImageLinks.Remove(oldCatImageLink);
                                }
                                db.SaveChanges();
                            }
                            #endregion
                        }
                        else
                        {
                            successModel.Success = ftpMoveSuccess;
                            return successModel;
                        }
                    }
                    // determine if this is the first image added to folder 
                    successModel.ReturnValue = db.CategoryImageLinks.Where(c => c.ImageCategoryId == model.DestinationFolderId).Count().ToString();
                    successModel.Success = "ok";
                } // using
            }
            catch (Exception ex)
            {
                successModel.Success = Helpers.ErrorDetails(ex);
            }
            return successModel;
        }
    }
}
