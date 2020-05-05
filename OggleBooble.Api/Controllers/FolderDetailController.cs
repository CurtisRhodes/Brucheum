using OggleBooble.Api.Models;
using OggleBooble.Api.MsSqlDataContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace OggleBooble.Api.Controllers
{
    public class FolderDetailController : ApiController
    {
        [HttpGet]
        public GetModelNameModel GetModelName(string linkId)
        {
            GetModelNameModel imageDetail = new GetModelNameModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var expectedImageDetail = (from l in db.ImageLinks
                                               join f in db.CategoryFolders on l.FolderLocation equals f.Id
                                               where l.Id == linkId
                                               select new GetModelNameModel()
                                               {
                                                   FolderId = f.Id,
                                                   Link = l.Link,
                                                   FolderName = f.FolderName,
                                                   RootFolder = f.RootFolder
                                               }).FirstOrDefault();
                    if (expectedImageDetail != null)
                        imageDetail = expectedImageDetail;
                    else
                        System.Diagnostics.Debug.WriteLine(linkId + " didnt work ");

                    imageDetail.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                imageDetail.Success = Helpers.ErrorDetails(ex);
            }
            return imageDetail;
        }

        [HttpGet]
        public FolderDetailModel Get(int folderId)
        {
            FolderDetailModel folderDetailModel = new FolderDetailModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder dbFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    folderDetailModel.FolderName = dbFolder.FolderName;
                    CategoryFolderDetail categoryFolderDetails = db.CategoryFolderDetails.Where(d => d.FolderId == folderId).FirstOrDefault();
                    if (categoryFolderDetails != null)
                    {
                        folderDetailModel.Measurements = categoryFolderDetails.Measurements;
                        folderDetailModel.Nationality = categoryFolderDetails.Nationality;
                        folderDetailModel.ExternalLinks = categoryFolderDetails.ExternalLinks;
                        folderDetailModel.CommentText = categoryFolderDetails.CommentText;
                        folderDetailModel.Born = categoryFolderDetails.Born;
                        folderDetailModel.Boobs = categoryFolderDetails.Boobs;
                        folderDetailModel.FolderId = categoryFolderDetails.FolderId;
                        folderDetailModel.LinkStatus = categoryFolderDetails.LinkStatus;
                        //folderDetailModel.FolderImage = Helpers.GetFirstImage(folderId);
                    }
                    ImageLink imageLink = db.ImageLinks.Where(g => g.Id == dbFolder.FolderImage).FirstOrDefault();
                    if (imageLink != null)
                    {
                        folderDetailModel.FolderImage = imageLink.Link;
                        folderDetailModel.IsLandscape = (imageLink.Width > imageLink.Height);
                    }
                }
                folderDetailModel.Success = "ok";
            }
            catch (Exception ex)
            {
                folderDetailModel.Success = Helpers.ErrorDetails(ex);
            }
            return folderDetailModel;
        }

        // create new folder in Posers Identified
        [HttpPost]
        public string Insert(FolderDetailModel model)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    db.CategoryFolderDetails.Add(new CategoryFolderDetail()
                    {
                        CommentText = model.CommentText,
                        ExternalLinks = model.ExternalLinks,
                        FolderId = model.FolderId,
                        Nationality = model.Nationality,
                        Measurements = model.Measurements,
                        Boobs = model.Boobs,
                        LinkStatus = model.LinkStatus,
                        Born = model.Born
                    });
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpPut]
        public string Update(FolderDetailModel model)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolderDetail dbFolderDetail = db.CategoryFolderDetails.Where(d => d.FolderId == model.FolderId).FirstOrDefault();
                    if (dbFolderDetail == null)
                        success = Insert(model);
                    else
                    {
                        dbFolderDetail.Born = model.Born;
                        dbFolderDetail.Boobs = model.Boobs;
                        dbFolderDetail.Nationality = model.Nationality;
                        dbFolderDetail.ExternalLinks = model.ExternalLinks;
                        dbFolderDetail.CommentText = model.CommentText;
                        dbFolderDetail.Measurements = model.Measurements;
                        dbFolderDetail.LinkStatus = model.LinkStatus;
                        db.SaveChanges();
                        success = "ok";
                    }
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        public string UpdateFolderImage(string linkId, int folderId, string level)
        {
            string success = "";
            try
            {
                using (var mdb = new MySqlDataContext.OggleBoobleMySqContext())
                {
                    var dbCategoryFolder = mdb.CategoryFolders.Where(f => f.Id == folderId).First();
                    var dbParentCategoryFolder = mdb.CategoryFolders.Where(f => f.Id == dbCategoryFolder.Parent).First();
                    dbParentCategoryFolder.FolderImage = linkId;
                    mdb.SaveChanges();
                }
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    if (level == "folder")
                    {
                        dbCategoryFolder.FolderImage = linkId;
                    }
                    else
                    {
                        CategoryFolder dbParentCategoryFolder = db.CategoryFolders.Where(f => f.Id == dbCategoryFolder.Parent).First();
                        dbParentCategoryFolder.FolderImage = linkId;
                    }
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }
    }
}
