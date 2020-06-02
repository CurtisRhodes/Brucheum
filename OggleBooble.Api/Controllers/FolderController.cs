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

        [HttpPost]
        [Route("api/Folder/Create")]
        public SuccessModel Create(int parentId, string newFolderName)
        {
            SuccessModel successModel = new SuccessModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == parentId).FirstOrDefault();

                    var folderPath = dbSourceFolder.FolderName;
                    if (folderPath.ToUpper().Contains("OGGLEBOOBLE.COM"))
                        folderPath = "";

                    string destinationFtpPath = ftpHost + dbSourceFolder.RootFolder + ".ogglebooble.com/" + Helpers.GetParentPath(parentId) + folderPath + "/" + newFolderName.Trim();
                    if (FtpUtilies.DirectoryExists(destinationFtpPath))
                        successModel.Success = "folder already exists";
                    else
                    {
                        string createDirSuccess = FtpUtilies.CreateDirectory(destinationFtpPath);
                        if (createDirSuccess == "ok")
                        {
                            CategoryFolder newFolder = new CategoryFolder()
                            {
                                Parent = parentId,
                                FolderName = newFolderName.Trim(),
                                SortOrder = 933,
                                RootFolder = dbSourceFolder.RootFolder
                            };
                            db.CategoryFolders.Add(newFolder);
                            db.SaveChanges();
                            int newFolderId = newFolder.Id;

                            //db.CategoryFolderDetails.Add(new CategoryFolderDetail() { FolderId = newFolderId, SortOrder = 99 });
                            //db.SaveChanges();

                            // now add it to Oracle
                            using (var mdb = new MySqlDataContext.OggleBoobleMySqContext())
                            {
                                MySqlDataContext.CategoryFolder newOracleRow = new MySqlDataContext.CategoryFolder();
                                try
                                {
                                    newOracleRow.PkId = Guid.NewGuid().ToString();
                                    newOracleRow.Id = newFolderId;
                                    newOracleRow.Parent = parentId;
                                    newOracleRow.FolderName = newFolderName.Trim();
                                    newOracleRow.RootFolder = dbSourceFolder.RootFolder;
                                    newOracleRow.SortOrder = 934;
                                    mdb.CategoryFolders.Add(newOracleRow);
                                    mdb.SaveChanges();
                                    successModel.Success = "ok";

                                    //MySqDataContext.CategoryFolderDetail oraCategoryFolderDetail = new MySqDataContext.CategoryFolderDetail();
                                    //oraCategoryFolderDetail.FolderId = newFolderId;
                                    //oraCategoryFolderDetail.SortOrder = 998;
                                    //mdb.CategoryFolderDetails.Add(oraCategoryFolderDetail);
                                    //oraCategoryFolderDetail.FolderId = newFolderId;
                                }
                                catch (Exception ex)
                                {
                                    successModel.Success = "Oracle Insert fail in CreateFolder: " + Helpers.ErrorDetails(ex);
                                    //Console.WriteLine("Oracle Insert fail in CreateFolder: " + Helpers.ErrorDetails(ex));
                                }
                                successModel.ReturnValue = newFolderId.ToString();
                            }
                        }
                        else
                            successModel.Success = createDirSuccess;
                    }
                }
            }
            catch (Exception ex) { successModel.Success = Helpers.ErrorDetails(ex); }
            return successModel;
        }

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

                    folderDetailModel.ContainsRomanNumerals = ContainsRomanNumerals(db.CategoryFolders.Where(f => f.Parent == folderId).ToList());
                    folderDetailModel.HasImages = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count() > 0;
                    folderDetailModel.FolderName = dbFolder.FolderName;
                    folderDetailModel.RootFolder = dbFolder.RootFolder;
                    folderDetailModel.FolderImage = db.ImageLinks.Where(i => i.Id == dbFolder.FolderImage).Select(i => i.Link).FirstOrDefault();
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

        private bool ContainsRomanNumerals(List<CategoryFolder> childFolders)
        {
            foreach (CategoryFolder childFolder in childFolders)
            {
                if (childFolder.FolderName.Contains(" I")) return true;
                if (childFolder.FolderName.Contains(" V")) return true;
                if (childFolder.FolderName.Contains(" X")) return true;
            }
            return false;
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
                    {
                        dbFolderDetail = new CategoryFolderDetail
                        {
                            FolderId = model.FolderId
                        };
                        db.CategoryFolderDetails.Add(dbFolderDetail);
                    }
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

    [EnableCors("*", "*", "*")]
    public class TrackbackLinkController : ApiController
    {
        [HttpGet]
        public TrackBackModel GetTrackBacks(int folderId)
        {
            TrackBackModel trackBackModel = new TrackBackModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    List<TrackbackLink> trackbackLinks = db.TrackbackLinks.Where(t => t.PageId == folderId).ToList();
                    foreach (TrackbackLink trackbackLink in trackbackLinks)
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
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    db.TrackbackLinks.Add(new TrackbackLink()
                    {
                        PageId = trackBackItem.PageId,
                        LinkStatus = trackBackItem.LinkStatus,
                        Site = trackBackItem.Site,
                        TrackBackLink = trackBackItem.TrackBackLink
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
        public string Update(TrackBackItem item)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    TrackbackLink trackbackLink = db.TrackbackLinks.Where(t => t.PageId == item.PageId).FirstOrDefault();
                    trackbackLink.Site = item.Site;
                    trackbackLink.LinkStatus = item.LinkStatus;
                    trackbackLink.Site = item.Site;
                    trackbackLink.TrackBackLink = item.TrackBackLink;
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
