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

        [HttpGet]
        [Route("api/CatFolder/GetFolderInfo")]
        public FolderDetailModel GetFolderInfo(int folderId)
        {
            var folderDetailModel = new FolderDetailModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbFolder = db.VirtualFolders.Where(f => f.Id == folderId).First();
                    folderDetailModel.Id = folderId;
                    folderDetailModel.FolderName = dbFolder.FolderName;
                    folderDetailModel.RootFolder = dbFolder.RootFolder;
                    folderDetailModel.FolderImage = dbFolder.FolderImage;  // db.ImageLinks.Where(i => i.Id == dbFolder.FolderImage).Select(i => i.Link).FirstOrDefault();

                   MySqlDataContext.CategoryFolderDetail categoryFolderDetails = db.CategoryFolderDetails.Where(d => d.Id == folderId).FirstOrDefault();

                    if (categoryFolderDetails != null)
                    {
                        folderDetailModel.HomeCountry = categoryFolderDetails.HomeCountry;
                        folderDetailModel.FolderComments = categoryFolderDetails.FolderComments;
                        folderDetailModel.Birthday = categoryFolderDetails.Birthday;
                        folderDetailModel.Measurements = categoryFolderDetails.Measurements;
                        folderDetailModel.FakeBoobs = categoryFolderDetails.FakeBoobs;
                        //folderDetailModel.LinkStatus = categoryFolderDetails.LinkStatus;
                        //folderDetailModel.FolderImage = Helpers.GetFirstImage(folderId);
                    }
                    var childFolders = db.VirtualFolders.Where(f => f.Parent == folderId).Select(f => f.FolderName).ToList();
                    var folderTypeModel = new FolderTypeModel()
                    {
                        RootFolder = dbFolder.RootFolder,
                        ContainsRomanNumeral = Helpers.ContainsRomanNumeral(dbFolder.FolderName),
                        ContainsRomanNumeralChildren = Helpers.ContainsRomanNumeralChildren(childFolders),
                        HasImages = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count() > 0,
                        HasSubFolders = db.VirtualFolders.Where(f => f.Parent == folderId).Count() > 0
                    };
                    folderDetailModel.FolderType = Helpers.DetermineFolderType(folderTypeModel);

                    //ImageLink imageLink = db.ImageLinks.Where(g => g.Id == dbFolder.FolderImage).FirstOrDefault();
                    //if (imageLink != null)
                    //{
                    //    folderDetailModel.FolderImage = imageLink.Link;
                    //}
                }
                folderDetailModel.Success = "ok";
            }
            catch (Exception ex)
            {
                folderDetailModel.Success = Helpers.ErrorDetails(ex);
            }
            return folderDetailModel;
        }

        [HttpPost]
        [Route("api/CatFolder/Create")]
        public SuccessModel Create(int parentId, string newFolderName)
        {
            SuccessModel successModel = new SuccessModel();
            try
            {
                string destinationFtpPath;
                string destinationRootFolder;
                //string folderPath;
                int newFolderId = 0;
                using (var db = new OggleBoobleMSSqlContext())
                {
                    MSSqlDataContext.CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == parentId).FirstOrDefault();
                    destinationFtpPath = ftpHost + dbSourceFolder.RootFolder + ".ogglebooble.com/" +
                        Helpers.GetParentPath(parentId) + dbSourceFolder.FolderName + "/" + newFolderName.Trim();

                    if (FtpUtilies.DirectoryExists(destinationFtpPath))
                    {
                        successModel.Success = "folder already exists";
                        return successModel;
                    }
                    destinationRootFolder = dbSourceFolder.RootFolder;
                    string createDirSuccess = FtpUtilies.CreateDirectory(destinationFtpPath);
                    if (createDirSuccess == "ok")
                    {
                        var newFolder = new MSSqlDataContext.CategoryFolder()
                        {
                            Parent = parentId,
                            FolderName = newFolderName.Trim(),
                            SortOrder = 933,
                            RootFolder = destinationRootFolder
                        };
                        db.CategoryFolders.Add(newFolder);
                        newFolderId = newFolder.Id;
                        db.CategoryFolderDetails.Add(new MSSqlDataContext.CategoryFolderDetail() 
                        { FolderId = newFolderId });
                        db.SaveChanges();
                    }
                    else
                    {
                        successModel.Success = createDirSuccess;
                        return successModel;
                    }
                }
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbParent = db.VirtualFolders.Where(f => f.Id == parentId).FirstOrDefault();
                    string folderPath = dbParent.FolderPath + "/" + newFolderName;

                    VirtualFolder newFolder = new VirtualFolder();
                    newFolder.Id = newFolderId;
                    newFolder.Parent = parentId;
                    newFolder.FolderName = newFolderName.Trim();
                    newFolder.RootFolder = destinationRootFolder;
                    newFolder.SortOrder = 934;
                    newFolder.FolderPath = folderPath;

                    db.VirtualFolders.Add(newFolder);
                    db.CategoryFolderDetails.Add(new MySqlDataContext.CategoryFolderDetail() { Id = newFolderId });
                    db.SaveChanges();
                    successModel.ReturnValue = newFolderId.ToString();
                    successModel.Success = "ok";
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

        [HttpGet]
        [Route("api/CatFolder/GetSearchResults")]
        public SearchResultsModel GetSearchResults(string searchString)
        {
            SearchResultsModel searchResultsModel = new SearchResultsModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    searchResultsModel.SearchResults =
                        (from f in db.VirtualFolders
                         where f.FolderName.StartsWith(searchString)
                         select new SearchResult() { FolderId = f.Id, FolderName = f.FolderName, Parent = f.RootFolder }).ToList();
                    List<SearchResult> containsSearchResults = 
                        (from f in db.VirtualFolders
                         where f.FolderName.Contains(searchString)
                         select new SearchResult() { FolderId = f.Id, FolderName = f.FolderName, Parent = f.RootFolder }).ToList();

                    foreach (SearchResult searchResult in containsSearchResults)
                    {
                        if (!searchResult.FolderName.ToLower().StartsWith(searchString.ToLower()))
                            searchResultsModel.SearchResults.Add(searchResult);
                    }
                }
                searchResultsModel.Success = "ok";
            }
            catch (Exception ex)
            {
                searchResultsModel.Success = Helpers.ErrorDetails(ex);
            }
            return searchResultsModel;
        }
    }

    [EnableCors("*", "*", "*")]
    public class FolderDetailController : ApiController
    {
        [HttpPut]
        [Route("api/FolderDetail/Update")]
        public string Update(FolderDetailModel model)
        {
            string success = "";
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    MySqlDataContext.CategoryFolderDetail dbFolderDetail = db.CategoryFolderDetails.Where(d => d.Id == model.Id).FirstOrDefault();
                    if (dbFolderDetail == null)
                    {
                        dbFolderDetail = new MySqlDataContext.CategoryFolderDetail { Id = model.Id };
                        db.CategoryFolderDetails.Add(dbFolderDetail);
                    }
                    else
                    {
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
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class TrackbackLinkController : ApiController
    {
        [HttpGet]
        public TrackBackModel GetTrackBacks(int folderId)
        {
            TrackBackModel trackBackModel = new TrackBackModel();
            try
            {
                using (var db = new OggleBoobleMSSqlContext())
                {
                    var trackbackLinks = db.TrackbackLinks.Where(t => t.PageId == folderId).ToList();
                    foreach (MSSqlDataContext.TrackbackLink trackbackLink in trackbackLinks)
                    {
                        trackBackModel.TrackBackItems.Add(new TrackBackItem()
                        {
                            Site = trackbackLink.Site,
                            TrackBackLink = trackbackLink.TrackBackLink,
                            LinkStatus = trackbackLink.LinkStatus
                        });
                    }
                    trackBackModel.Success = "ok";
                }
                using (var db = new OggleBoobleMySqlContext())
                {
                    List<MySqlDataContext.TrackbackLink> trackbackLinks = db.TrackbackLinks.Where(t => t.PageId == folderId).ToList();
                    foreach (MySqlDataContext.TrackbackLink trackbackLink in trackbackLinks)
                    {
                        trackBackModel.TrackBackItems.Add(new TrackBackItem()
                        {
                            Site = trackbackLink.SiteCode,
                            TrackBackLink = trackbackLink.Href,
                            LinkStatus = trackbackLink.LinkStatus
                        });
                    }
                    trackBackModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                trackBackModel.Success = Helpers.ErrorDetails(ex);
            }
            return trackBackModel;
        }

        [HttpPost]
        public string Insert(TrackBackItem trackBackItem)
        {
            string success;
            try
            {                
                using (var db = new OggleBoobleMSSqlContext())
                {
                    db.TrackbackLinks.Add(new MSSqlDataContext.TrackbackLink()
                    {
                        PageId = trackBackItem.PageId,
                        LinkStatus = trackBackItem.LinkStatus,
                        Site = trackBackItem.Site,
                        TrackBackLink = trackBackItem.TrackBackLink
                    });
                    db.SaveChanges();
                    success = "ok";
                }
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.TrackbackLinks.Add(new MySqlDataContext.TrackbackLink()
                    {
                        PageId = trackBackItem.PageId,
                        LinkStatus = trackBackItem.LinkStatus,
                        SiteCode = trackBackItem.Site,
                        Href = trackBackItem.TrackBackLink
                    });
                    db.SaveChanges();
                }
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpPut]
        public string Update(TrackBackItem item)
        {
            string success = "";
            try
            {
                using (var db = new OggleBoobleMSSqlContext())
                {
                    MSSqlDataContext.TrackbackLink trackbackLink = db.TrackbackLinks.Where(t => t.PageId == item.PageId).FirstOrDefault();
                    trackbackLink.Site = item.Site;
                    trackbackLink.LinkStatus = item.LinkStatus;
                    trackbackLink.TrackBackLink = item.TrackBackLink;
                    db.SaveChanges();
                }
                using (var db = new OggleBoobleMySqlContext())
                {
                    MySqlDataContext.TrackbackLink trackbackLink = db.TrackbackLinks.Where(t => t.PageId == item.PageId).FirstOrDefault();
                    trackbackLink.SiteCode = item.Site;
                    trackbackLink.LinkStatus = item.LinkStatus;
                    trackbackLink.Href = item.TrackBackLink;
                    db.SaveChanges();
                }
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }
    }

}
