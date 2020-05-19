using OggleBooble.Api.Models;
using OggleBooble.Api.MsSqlDataContext;
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
    public class FolderController : ApiController
    {
        //private readonly string repoPath = "F:/Danni/";
        private readonly string hostingPath = ".ogglebooble.com/";
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        //static readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        //static readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        //static readonly NetworkCredential networkCredentials = new NetworkCredential(ftpUserName, ftpPassword);

        [HttpPut]
        [Route("api/Folder/Rename")]
        public string Rename(int folderId, string newFolderName)
        {
            string success = "";
            try
            {
                string oldName;
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
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
                    using (var mdb = new MySqlDataContext.OggleBoobleMySqContext())
                    {
                        MySqlDataContext.CategoryFolder mySqlCategoryFolder = mdb.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
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
        [Route("api/Folder/GetSearchResults")]
        public SearchResultsModel GetSearchResults(string searchString)
        {
            SearchResultsModel searchResultsModel = new SearchResultsModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    searchResultsModel.SearchResults =
                        (from f in db.CategoryFolders
                         where f.FolderName.StartsWith(searchString)
                         select new SearchResult() { FolderId = f.Id, FolderName = f.FolderName, Parent = f.RootFolder }).ToList();
                    List<SearchResult> containsSearchResults = 
                        (from f in db.CategoryFolders
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
        [HttpGet]
        [Route("api/FolderDetail/GetFolderInfo")]
        public FolderDetailModel GetFolderInfo(int folderId)
        {
            var folderDetailModel = new FolderDetailModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder dbFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    folderDetailModel.FolderName = dbFolder.FolderName;
                    folderDetailModel.RootFolder = dbFolder.RootFolder;

                    CategoryFolderDetail categoryFolderDetails = db.CategoryFolderDetails.Where(d => d.FolderId == folderId).FirstOrDefault();
                    if (categoryFolderDetails != null)
                    {
                        //folderDetailModel.FolderName = categoryFolderDetails.;
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
