using OggleBooble.Api.Models;
using OggleBooble.Api.MsSqlDataContext;
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
    public class CategoryFolderController : ApiController
    {
        private readonly string hostingPath = ".ogglebooble.com/";
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        //static readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        //static readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        //static readonly NetworkCredential networkCredentials = new NetworkCredential(ftpUserName, ftpPassword);

        [HttpGet]
        [Route("api/Folder/GetFolderInfo")]
        public FolderDetailModel GetFolderInfo(int folderId)
        {
            var folderDetailModel = new FolderDetailModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    MySqlDataContext.CategoryFolder dbFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    folderDetailModel.FolderId = folderId;
                    folderDetailModel.FolderName = dbFolder.FolderName;
                    folderDetailModel.RootFolder = dbFolder.RootFolder;
                    folderDetailModel.FolderImage = db.ImageLinks.Where(i => i.Id == dbFolder.FolderImage).Select(i => i.Link).FirstOrDefault();

                    MySqlDataContext.CategoryFolderDetail categoryFolderDetails = db.CategoryFolderDetails.Where(d => d.FolderId == folderId).FirstOrDefault();


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
                    var folderTypeModel = new FolderTypeModel()
                    {
                        RootFolder = dbFolder.RootFolder,
                        ContainsRomanNumeral = Helpers.ContainsRomanNumeral(dbFolder.FolderName),
                        ContainsRomanNumeralChildren = Helpers.ContainsRomanNumeralChildren(db.CategoryFolders.Where(f => f.Parent == folderId).ToList()),
                        HasImages = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count() > 0,
                        HasSubFolders = db.CategoryFolders.Where(f => f.Parent == folderId).Count() > 0,
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
        [Route("api/Folder/Create")]
        public SuccessModel Create(int parentId, string newFolderName)
        {
            SuccessModel successModel = new SuccessModel();
            try
            {
                string destinationFtpPath;
                string destinationRootFolder;
                string folderPath;
                int newFolderId = 0;
                using (var db = new OggleBoobleMSSqlContext())
                {
                    MsSqlDataContext.CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == parentId).FirstOrDefault();
                    folderPath = dbSourceFolder.FolderName;
                    destinationFtpPath = ftpHost + dbSourceFolder.RootFolder + ".ogglebooble.com/" +
                        Helpers.GetParentPath(parentId) + folderPath + "/" + newFolderName.Trim();

                    if (FtpUtilies.DirectoryExists(destinationFtpPath))
                    {
                        successModel.Success = "folder already exists";
                        return successModel;
                    }
                    destinationRootFolder = dbSourceFolder.RootFolder;
                    if (folderPath.ToUpper().Contains("OGGLEBOOBLE.COM"))
                        folderPath = "";
                    else
                    {
                        string createDirSuccess = FtpUtilies.CreateDirectory(destinationFtpPath);
                        if (createDirSuccess == "ok")
                        {
                            var newFolder = new MsSqlDataContext.CategoryFolder()
                            {
                                Parent = parentId,
                                FolderName = newFolderName.Trim(),
                                SortOrder = 933,
                                RootFolder = destinationRootFolder
                            };
                            db.CategoryFolders.Add(newFolder);
                            db.SaveChanges();
                            newFolderId = newFolder.Id;
                            //db.CategoryFolderDetails.Add(new CategoryFolderDetail() { FolderId = newFolderId, SortOrder = 99 });
                            //db.SaveChanges();
                            // now add it to Oracle
                        }
                        else
                        {
                            successModel.Success = createDirSuccess;
                            return successModel;
                        }
                    }
                }
                using (var mdb = new OggleBoobleMySqlContext())
                {
                    MySqlDataContext.CategoryFolder newOracleRow = new MySqlDataContext.CategoryFolder();
                    try
                    {
                        newOracleRow.PkId = Guid.NewGuid().ToString();
                        newOracleRow.Id = newFolderId;
                        newOracleRow.Parent = parentId;
                        newOracleRow.FolderName = newFolderName.Trim();
                        newOracleRow.RootFolder = destinationRootFolder;
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
                using (var db = new OggleBoobleMSSqlContext())
                {
                    MsSqlDataContext.CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
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
                    using (var mdb = new MySqlDataContext.OggleBoobleMySqlContext())
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
                using (var db = new OggleBoobleMySqlContext())
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
        [HttpPut]
        [Route("api/FolderDetail/GetSearchResults")]
        public string Update(FolderDetailModel model)
        {
            string success = "";
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    MySqlDataContext.CategoryFolderDetail dbFolderDetail = db.CategoryFolderDetails.Where(d => d.FolderId == model.FolderId).FirstOrDefault();
                    if (dbFolderDetail == null)
                    {
                        dbFolderDetail = new MySqlDataContext.CategoryFolderDetail
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
                using (var db = new OggleBoobleMSSqlContext())
                {
                    MsSqlDataContext.CategoryFolderDetail dbFolderDetail = db.CategoryFolderDetails.Where(d => d.FolderId == model.FolderId).FirstOrDefault();
                    if (dbFolderDetail == null)
                    {
                        dbFolderDetail = new MsSqlDataContext.CategoryFolderDetail
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
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    var dbParentCategoryFolder = db.CategoryFolders.Where(f => f.Id == dbCategoryFolder.Parent).First();
                    if (level == "folder")
                        dbCategoryFolder.FolderImage = linkId;
                    else
                        dbParentCategoryFolder.FolderImage = linkId;
                    db.SaveChanges();
                }
                using (var db = new OggleBoobleMSSqlContext())
                {
                    var dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    var dbParentCategoryFolder = db.CategoryFolders.Where(f => f.Id == dbCategoryFolder.Parent).First();
                    if (level == "folder")
                        dbCategoryFolder.FolderImage = linkId;
                    else
                        dbParentCategoryFolder.FolderImage = linkId;
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
                    foreach (MsSqlDataContext.TrackbackLink trackbackLink in trackbackLinks)
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
                    db.TrackbackLinks.Add(new MsSqlDataContext.TrackbackLink()
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
                    MsSqlDataContext.TrackbackLink trackbackLink = db.TrackbackLinks.Where(t => t.PageId == item.PageId).FirstOrDefault();
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
