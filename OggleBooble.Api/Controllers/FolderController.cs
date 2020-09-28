using OggleBooble.Api.Models;
using OggleBooble.Api.MSSqlDataContext;
using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class CatFolderController : ApiController
    {
        private readonly string hostingPath = ".ogglebooble.com/";
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        private readonly string imgRepo = ConfigurationManager.AppSettings["ImageRepository"];

        //url: settingsArray.ApiServer + "api/CatFolder/GetFolderType?folderId=" + folderId,

        [HttpPost]
        [Route("api/CatFolder/Create")]
        public SuccessModel Create(int parentId, string newFolderName)
        {
            SuccessModel successModel = new SuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    string ftpRepo = imgRepo.Substring(7);
                    var dbDestParent = db.VirtualFolders.Where(i => i.Id == parentId).First();
                    string newFtpPath = ftpHost + ftpRepo + "/" + dbDestParent.FolderPath + "/" + newFolderName;
                    if (FtpUtilies.DirectoryExists(newFtpPath))
                    {
                        successModel.Success = "folder already exists";
                        return successModel;
                    }

                    successModel.Success = FtpUtilies.CreateDirectory(newFtpPath);
                    if (successModel.Success == "ok")
                    {
                        VirtualFolder newFolder = new VirtualFolder();
                        //newFolder.Id = newFolderId;
                        newFolder.Parent = parentId;
                        newFolder.FolderName = newFolderName.Trim();
                        newFolder.FolderType = "singleChild";
                        newFolder.RootFolder = dbDestParent.RootFolder;
                        newFolder.SortOrder = 934;
                        newFolder.FolderPath = dbDestParent.FolderPath + "/" + newFolderName;
                        db.VirtualFolders.Add(newFolder);
                        db.SaveChanges();
                        int newFolderId = newFolder.Id;
                        successModel.ReturnValue = newFolderId.ToString();
                        successModel.Success = "ok";
                    }
                }
            }
            catch (Exception ex) { successModel.Success = Helpers.ErrorDetails(ex); }
            return successModel;
        }

        [HttpPut]
        [Route("api/CatFolder/Rename")]
        public string Rename(int folderId, string newFolderName)
        {
            string success = "";
            try
            {
                string oldName;
                using (var db = new OggleBoobleMSSqlContext())
                {
                    MSSqlDataContext.CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    oldName = dbSourceFolder.FolderName;
                    string parentPath = Helpers.GetParentPath(folderId);
                    string ftpPath = ftpHost + dbSourceFolder.RootFolder + hostingPath + parentPath + oldName;

                    string[] serverSideFiles = FtpUtilies.GetFiles(ftpPath);
                    string fileNameGuid = "";
                    string newFileName = "";
                    foreach (string serverSideFile in serverSideFiles)
                    {
                        fileNameGuid = serverSideFile.Substring(serverSideFile.LastIndexOf("_"));
                        newFileName = newFolderName + fileNameGuid;
                        FtpUtilies.RenameFile(ftpPath + "/" + serverSideFile, newFileName);
                    }
                    success = FtpUtilies.RenameFolder(ftpPath, newFolderName);
                    if (success == "ok")
                    {
                        dbSourceFolder.FolderName = newFolderName;
                        db.SaveChanges();
                    }
                }
                if (success == "ok")
                {
                    using (var mdb = new OggleBoobleMySqlContext())
                    { 
                        var mySqlCategoryFolder = mdb.VirtualFolders.Where(f => f.Id == folderId).FirstOrDefault();
                        mySqlCategoryFolder.FolderName = newFolderName;
                        mdb.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpPut]
        [Route("api/CatFolder/Move")]
        public string Move(int folderId, int newParent)
        {
            string success = "";
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbFolder = db.VirtualFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    dbFolder.Parent = newParent;
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }


        [HttpGet]
        [Route("api/CatFolder/GetSearchResults")]
        public SearchResultsModel GetSearchResults(string searchString)
        {
            SearchResultsModel searchResultsModel = new SearchResultsModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
               {
                    searchResultsModel.SearchResults.AddRange(
                    (from f in db.VirtualFolders
                     where (f.FolderName.StartsWith(searchString) && ((f.FolderType == "singleModel") || (f.FolderType == "singleParent")))
                     select new SearchResult() { FolderId = f.Id, FolderPath = f.FolderPath }).ToList());

                    searchResultsModel.SearchResults.AddRange(
                        (from f in db.VirtualFolders
                         where ((f.FolderName.Contains(searchString)) && (!f.FolderName.StartsWith(searchString))
                         && ((f.FolderType == "singleModel") || (f.FolderType == "singleParent")))
                         select new SearchResult() { FolderId = f.Id, FolderPath = f.FolderPath }).ToList());

                }
                searchResultsModel.Success = "ok";
            }
            catch (Exception ex)
            {
                searchResultsModel.Success = Helpers.ErrorDetails(ex);
            }
            return searchResultsModel;
        }

        [HttpPost]
        [Route("api/CatFolder/AddStepChild")]
        public string AddStepChild(StepchildModel stepchildModel)
        {
            string success = "";
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var folderToMove = db.VirtualFolders.Where(f => f.Id == stepchildModel.SourceFileId).First();
                    db.StepChildren.Add(new MySqlDataContext.StepChild()
                    {
                        Parent = stepchildModel.DestinationId,
                        Child = stepchildModel.SourceFileId,
                        FolderName = stepchildModel.FolderName ?? folderToMove.FolderName,
                        Link = stepchildModel.LinkId ?? folderToMove.FolderImage,
                        SortOrder = stepchildModel.SortOrder
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
    }

    [EnableCors("*", "*", "*")]
    public class FolderDetailController : ApiController
    {
        [HttpGet]
        [Route("api/FolderDetail/GetQuickFolderInfo")]
        public FolderInfoModel GetQuickFolderInfo(int folderId)
        {
            var folderInfo = new FolderInfoModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbFolder = db.VirtualFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    if (dbFolder == null)
                    {
                        folderInfo.Success = "folder not found";
                        return folderInfo;
                    }
                    folderInfo.FolderType = dbFolder.FolderType;
                    folderInfo.FolderName = dbFolder.FolderName;
                    folderInfo.Parent = dbFolder.Parent;
                    var dbFolderDetails = db.FolderDetails.Where(d => d.FolderId == folderId).FirstOrDefault();
                    if (dbFolderDetails != null)
                        folderInfo.FolderComments = dbFolderDetails.FolderComments;
                    folderInfo.Success = "ok";
                    folderInfo.Success = "ok";
                }
            }
            catch (Exception ex) { folderInfo.Success = Helpers.ErrorDetails(ex); }
            return folderInfo;
        }

        [HttpGet]
        [Route("api/FolderDetail/GetFullFolderInfo")]
        public FolderDetailModel GetFullFolderInfo(int folderId)
        {
            var folderDetailModel = new FolderDetailModel();
            try
            {
                string repoDomain = ConfigurationManager.AppSettings["ImageRepository"];
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbFolder = db.VirtualFolders.Where(f => f.Id == folderId).First();
                    string fullPathName = "";
                    if (dbFolder.FolderImage != null)
                    {
                        var dbImageFile = db.ImageFiles.Where(i => i.Id == dbFolder.FolderImage).FirstOrDefault();
                        if (dbImageFile != null)
                        {
                            var imgFolderPath = db.VirtualFolders.Where(f => f.Id == dbImageFile.FolderId).First().FolderPath;
                            //string fileName = dbImageFile.FileName;
                            bool nw = (imgFolderPath == dbFolder.FolderPath);
                            fullPathName = repoDomain + "/" + imgFolderPath + "/" + dbImageFile.FileName;
                        }
                    }

                    folderDetailModel.FolderId = folderId;
                    folderDetailModel.FolderType = dbFolder.FolderType;
                    folderDetailModel.FolderName = dbFolder.FolderName;
                    folderDetailModel.RootFolder = dbFolder.RootFolder;
                    folderDetailModel.FolderImage = fullPathName;
                    folderDetailModel.InternalLinks = (from l in db.CategoryImageLinks
                                                       join f in db.VirtualFolders on l.ImageCategoryId equals f.Id
                                                       where l.ImageCategoryId == folderId && l.ImageCategoryId != folderId
                                                       select new { folderId = f.Id, folderName = f.FolderName })
                                                       .ToDictionary(i => i.folderId, i => i.folderName);
                    FolderDetail FolderDetails = db.FolderDetails.Where(d => d.FolderId == folderId).FirstOrDefault();
                    if (FolderDetails != null)
                    {
                        folderDetailModel.HomeCountry = FolderDetails.HomeCountry;
                        folderDetailModel.HomeTown = FolderDetails.HomeTown;
                        folderDetailModel.FolderComments = FolderDetails.FolderComments;
                        folderDetailModel.Birthday = FolderDetails.Birthday;
                        folderDetailModel.Measurements = FolderDetails.Measurements;
                        folderDetailModel.FakeBoobs = FolderDetails.FakeBoobs;
                    }
                    folderDetailModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                folderDetailModel.Success = Helpers.ErrorDetails(ex);
            }
            return folderDetailModel;
        }

        [HttpPut]
        [Route("api/FolderDetail/AddUpdate")]
        public string AddUpdate(FolderDetailModel model)
        {
            string success = "";
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    FolderDetail dbFolderDetail = db.FolderDetails.Where(d => d.FolderId == model.FolderId).FirstOrDefault();
                    if (dbFolderDetail == null)
                    {
                        dbFolderDetail = new FolderDetail { FolderId = model.FolderId };
                        db.FolderDetails.Add(dbFolderDetail);
                        db.SaveChanges();
                        dbFolderDetail = db.FolderDetails.Where(d => d.FolderId == model.FolderId).First();
                    }
                    dbFolderDetail.Birthday = model.Birthday;
                    dbFolderDetail.FakeBoobs = model.FakeBoobs;
                    dbFolderDetail.HomeCountry = model.HomeCountry;
                    dbFolderDetail.HomeTown = model.HomeTown;
                    dbFolderDetail.FolderComments = model.FolderComments;
                    dbFolderDetail.Measurements = model.Measurements;
                    //dbFolderDetail.LinkStatus = model.LinkStatus;
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPost]
        [Route("api/FolderDetail/AddEditTrackBackLink")]
        public TrackbackSuccessModel AddEditTrackBackLink(TrackbackLink trackBackItem)
        {
            var successModel = new TrackbackSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbTrackBack = db.TrackbackLinks.Where(t => t.PageId == trackBackItem.PageId && t.SiteCode == trackBackItem.SiteCode).FirstOrDefault();
                    if (dbTrackBack == null)
                    {
                        db.TrackbackLinks.Add(trackBackItem);
                        successModel.SaveMode = "Insert";
                    }
                    else
                    {
                        dbTrackBack.LinkStatus = trackBackItem.LinkStatus;
                        dbTrackBack.Href = trackBackItem.Href;
                        successModel.SaveMode = "Update";
                    }
                    db.SaveChanges();

                    var trackbackLinks = db.TrackbackLinks.Where(t => t.PageId == trackBackItem.PageId).ToList();
                    foreach (TrackbackLink trackbackLink in trackbackLinks)
                    {
                        successModel.TrackBackItems.Add(new TrackbackLink()
                        {
                            SiteCode = trackbackLink.SiteCode,
                            Href = trackbackLink.Href,
                            LinkStatus = trackbackLink.LinkStatus
                        });
                    }


                    successModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                successModel.Success = Helpers.ErrorDetails(ex);
            }
            return successModel;
        }

        [HttpGet]
        [Route("api/FolderDetail/GetTrackBackLinks")]
        public TrackbackItemsModel GetTrackBackLinks(int folderId)
        {
            var trackbackItems = new TrackbackItemsModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var trackbackLinks = db.TrackbackLinks.Where(t => t.PageId == folderId).ToList();
                    foreach (TrackbackLink trackbackLink in trackbackLinks)
                    {
                        trackbackItems.TrackBackItems.Add(new TrackbackLink()
                        {
                            SiteCode = trackbackLink.SiteCode,
                            Href = trackbackLink.Href,
                            LinkStatus = trackbackLink.LinkStatus
                        });
                    }
                    trackbackItems.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                trackbackItems.Success = Helpers.ErrorDetails(ex);
            }
            return trackbackItems;
        }
    }

    [EnableCors("*", "*", "*")]
    public class FolderCommentController : ApiController
    {
        [HttpPost]
        [Route("api/FolderComment/AddFolderComment")]
        public string AddEditTrackBackLink(FolderCommentModel folderCommentModel)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.FolderComments.Add(new FolderComment()
                    {
                        PkId = Guid.NewGuid().ToString(),
                        VisitorId = folderCommentModel.VisitorId,
                        FolderId = folderCommentModel.FolderId,
                        CommentText = folderCommentModel.CommentText,
                        Posted = DateTime.Now
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

        [HttpGet]
        [Route("api/FolderComment/GetFolderComments")]
        public FolderCommentSuccessModel GetFolderComments(int folderId)
        {
            var folderCommentSuccessModel = new FolderCommentSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    folderCommentSuccessModel.FolderComments = db.FolderComments.Where(f => f.FolderId == folderId).ToList();
                    folderCommentSuccessModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                folderCommentSuccessModel.Success = Helpers.ErrorDetails(ex);
            }
            return folderCommentSuccessModel;
        }
    }
}
