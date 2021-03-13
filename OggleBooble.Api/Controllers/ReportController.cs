using OggleBooble.Api.Models;
using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.Cors;
using IronPdf;
using System.IO;
using System.Text;
using System.Configuration;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class ReportController : ApiController
    {
        [HttpGet]
        [Route("api/Report/MetricMatrixReport")]
        public MatrixResultsModel MetricsMatrixReport()
        {
            var rslts = new MatrixResultsModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.PageHits.RemoveRange(db.PageHits.Where(h => h.VisitorId == "ec6fb880-ddc2-4375-8237-021732907510"));
                    db.ImageHits.RemoveRange(db.ImageHits.Where(i => i.VisitorId == "ec6fb880-ddc2-4375-8237-021732907510"));
                    db.SaveChanges();
                    db.Database.ExecuteSqlCommand("call OggleBooble.spDailyVisits()");
                    var performanceRows = db.Performances.ToList();
                    foreach (Performance pRow in performanceRows)
                    {
                        rslts.mRows.Add(new MatrixModel()
                        {
                            ReportDay = pRow.ReportDay,
                            DayofWeek = pRow.ReportDay.DayOfWeek.ToString(),
                            DateString = pRow.DayString,
                            NewVisitors = pRow.NewVisitors,
                            Visits = pRow.Visits,
                            PageHits = pRow.PageHits,
                            ImageHits = pRow.ImageHits
                        });
                    }
                    rslts.Success = "ok";
                }
            }
            catch (Exception ex) { rslts.Success = Helpers.ErrorDetails(ex); }
            return rslts;
        }
        
        [HttpGet]
        [Route("api/Report/DailyVisitors")]
        public DailyVisitorsReportModel DailyVisitors(DateTime visitDate)
        {
            var dailyVisitors = new DailyVisitorsReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    // "where Occured between date_add(current_date(), interval -1 day) and current_date()" +
                    dailyVisitors.Visitors = db.VwVisitors.Where(v => v.InitialVisit == visitDate).ToList();
                }
                dailyVisitors.Success = "ok";
            }
            catch (Exception ex) { dailyVisitors.Success = Helpers.ErrorDetails(ex); }
            return dailyVisitors;
        }

        [HttpGet]
        [Route("api/Report/DailyVisits")]
        public DailyVisitorsReportModel DailyVisits(DateTime visitDate)
        {
            var dailyVisitors = new DailyVisitorsReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    dailyVisitors.Visitors = db.VwVisitors.Where(v => v.InitialVisit == visitDate).ToList();
                }
                dailyVisitors.Success = "ok";
            }
            catch (Exception ex) { dailyVisitors.Success = Helpers.ErrorDetails(ex); }
            return dailyVisitors;
        }

        [HttpGet]
        [Route("api/Report/MostVisitedPagesReport")]
        public MostPopularPagesReportModel MostVisitedPagesReport()
        {
            var mostPopularPages = new MostPopularPagesReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    mostPopularPages.Items = db.Database.SqlQuery<MostPopularPagesReportItem>(
                         "select FolderName PageName, f.Id FolderId, count(*) PageHits " +
                         "from OggleBooble.PageHit h " +
                         "join OggleBooble.CategoryFolder f on h.PageId = f.Id " +
                         "where Occured between date_add(current_date(), interval -1 day) and current_date()" +
                         "group by PageId " +
                         "order by PageHits desc").ToList();
                }
                mostPopularPages.Success = "ok";
            }
            catch (Exception ex) { mostPopularPages.Success = Helpers.ErrorDetails(ex); }
            return mostPopularPages;
        }

        [HttpGet]
        [Route("api/Report/MostImageHitsReport")]
        public MostPopularPagesReportModel MostImageHitsReport()
        {
            var MostImageHits = new MostPopularPagesReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    // select * from OggleBooble.vwImageHitsForToday;

                    MostImageHits.Items = db.Database.SqlQuery<MostPopularPagesReportItem>(
                        "select FolderName PageName, f.Id FolderId, count(*) PageHits " +
                        "from OggleBooble.ImageHit h " +
                        "join OggleBooble.CategoryFolder f on h.PageId = f.Id " +
                        "where HitDateTime between date_add(current_date(), interval - 1 day) and current_date() " +
                        "group by PageId order by PageHits desc").ToList();
                }
                MostImageHits.Success = "ok";
            }
            catch (Exception ex) { MostImageHits.Success = Helpers.ErrorDetails(ex); }
            return MostImageHits;
        }

        [HttpGet]
        [Route("api/Report/LatestImageHits")]
        public LatestImageHitsReportModel LatestImageHits()
        {
            var imageHitsReportModel = new LatestImageHitsReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.ImageHits.RemoveRange(db.ImageHits.Where(i => i.VisitorId == "ec6fb880-ddc2-4375-8237-021732907510"));

                    List<VwImageHit> imageHits = db.VwImageHits.ToList();
                    foreach (VwImageHit imageHit in imageHits)
                    {
                        imageHitsReportModel.Items.Add(new LatestImageHitsItem()
                        {
                            IpAddress = imageHit.IpAddress,
                            City = imageHit.City,
                            Region = imageHit.Region,
                            Country = imageHit.Country,
                            FolderName = imageHit.FolderName,
                            PageId = imageHit.PageId,
                            HitTime = imageHit.HitTime,
                            Link = imageHit.Link
                        });
                    }
                    imageHitsReportModel.HitCount = db.ImageHits.Where(h => h.HitDateTime > DateTime.Today).Count();
                }
                imageHitsReportModel.Success = "ok";
            }
            catch (Exception ex) { imageHitsReportModel.Success = Helpers.ErrorDetails(ex); }
            return imageHitsReportModel;
        }
        
        [HttpGet]
        [Route("api/Report/EventLog")]
        public EventReportModel EventLog()
        {
            var eventReport = new EventReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.EventLogs.RemoveRange(db.EventLogs.Where(e => e.VisitorId == "ec6fb880-ddc2-4375-8237-021732907510"));
                    db.SaveChanges();
                    List<VwEventLog> eventLog = db.VwEventLogs.ToList();
                    foreach (var item in eventLog)
                    {
                        eventReport.Items.Add(new EventItem()
                        {
                            IpAddress = item.IpAddress,
                            City = item.City,
                            Region = item.Region,
                            Country = item.Country,
                            Event = item.Event,
                            CalledFrom = item.CalledFrom,
                            Detail = item.Detail,
                            HitDate = item.HitDate,
                            HitTime = item.HitTime
                        });
                    }
                    eventReport.HitCount = db.EventLogs.Where(h => h.Occured > DateTime.Today).Count();
                }
                eventReport.Success = "ok";
            }
            catch (Exception ex) { eventReport.Success = Helpers.ErrorDetails(ex); }
            return eventReport;
        }

        [HttpGet]
        [Route("api/Report/ActivityReport")]
        public ActivityReportModel ActivityReport()
        {
            var activityReport = new ActivityReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.ActivityLogs.RemoveRange(db.ActivityLogs.Where(a => a.VisitorId == "ec6fb880-ddc2-4375-8237-021732907510"));
                    db.SaveChanges();
                    
                    List<VwActivityLog> activityItems = db.VwActivityLogs.ToList();
                    foreach (var activityItem in activityItems)
                    {
                        activityReport.Items.Add(new VwActivityLog()
                        {
                            ActivityCode = activityItem.ActivityCode,
                            Activity = activityItem.Activity,
                            City = activityItem.City,
                            Region = activityItem.Region,
                            Country = activityItem.Country,
                            FolderId = activityItem.FolderId,
                            FolderName = activityItem.FolderName,
                            Occured = activityItem.Occured
                        });
                    }
                    activityReport.HitCount = db.EventLogs.Where(h => h.Occured > DateTime.Today).Count();
                }
                activityReport.Success = "ok";
            }
            catch (Exception ex) { activityReport.Success = Helpers.ErrorDetails(ex); }
            return activityReport;
        }

        [HttpGet]
        [Route("api/Report/MostActiveUsersReport")]
        public MostActiveUsersModel MostActiveUsersReport()
        {
            var mostActiveUsersReport = new MostActiveUsersModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.ImageHits.RemoveRange(db.ImageHits.Where(i => i.VisitorId == "ec6fb880-ddc2-4375-8237-021732907510"));

                    var mostActiveUserItems = db.MostActiveUsersForToday.ToList();
                    foreach (VwMostActiveUsersForToday mostActiveUserItem in mostActiveUserItems)
                    {
                        mostActiveUsersReport.Items.Add(new MostActiveUsersItem()
                        {
                            IpAddress = mostActiveUserItem.IpAddress,
                            City = mostActiveUserItem.City,
                            Region = mostActiveUserItem.Region,
                            Country = mostActiveUserItem.Country,
                            ImageHitsToday = mostActiveUserItem.ImageHitsToday,
                            TotalImageHits = mostActiveUserItem.TotalImageHits,
                            PageHitsToday = mostActiveUserItem.PageHitsToday,
                            TotalPageHits = mostActiveUserItem.TotalPageHits,
                            LastHit = mostActiveUserItem.LastHit,
                            InitialVisit = mostActiveUserItem.InitialVisit,
                            UserName = mostActiveUserItem.UserName
                        });
                    }
                    //mostActiveUsersReport.Items = db.Database.SqlQuery<MostActiveUsersItem>(
                    //    "select IpAddress, City, Region, Country, " +
                    //    "max(date_format(HitDateTime, '%m/%d/%Y')) as 'LastHit', max(date_format(HitDateTime, '%h:%i.%s')) as hitTime, count(*) imageHits " +
                    //    "from OggleBooble.ImageHit ih " +
                    //    "join OggleBooble.Visitor v on ih.VisitorId = v.VisitorId " +
                    //    "where HitDateTime between current_date and current_date + 1 " +
                    //    "group by IpAddress, City, Region, Country " +
                    //    "order by imageHits desc;").ToList();

                    mostActiveUsersReport.HitCount = mostActiveUsersReport.Items.Count();
                }
                mostActiveUsersReport.Success = "ok";
            }
            catch (Exception ex) { mostActiveUsersReport.Success = Helpers.ErrorDetails(ex); }
            return mostActiveUsersReport;
        }

        [HttpGet]
        [Route("api/Report/PageHitReport")]
        public PageHitReportModel PageHitReport()
        {
            var pageHitReportModel = new PageHitReportModel();
            //int errCount = 0;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.PageHits.RemoveRange(db.PageHits.Where(h => h.VisitorId == "ec6fb880-ddc2-4375-8237-021732907510"));
                    db.SaveChanges();

                    //List<VwPageHit> vwPageHits = db.VwPageHits.Take(500).ToList();

                    List<VwPageHit> vwPageHits = db.VwPageHits.ToList();
                    pageHitReportModel.HitCount = db.PageHits.Count();

                    foreach (VwPageHit item in vwPageHits)
                    {
                        pageHitReportModel.Items.Add(new PageHitReportModelItem()
                        {
                            IpAddress = item.IpAddress,
                            City = item.City,
                            Region = item.Region,
                            Country = item.Country,
                            PageId = item.PageId,
                            FolderName = item.FolderName, // ?? "?",item.FolderName.Replace("OGGLEBOOBLE.COM", ""),
                            //PageHits = item.PageHits,
                            RootFolder = item.RootFolder,
                            FolderType = item.FolderType,
                            ImageHits = item.ImageHits,
                            HitDate = item.HitDate,
                            HitTime = item.HitTime
                        });
                    }
                }
                pageHitReportModel.Success = "ok";
            }
            catch (Exception ex)
            {
                pageHitReportModel.Success = Helpers.ErrorDetails(ex);
            }
            return pageHitReportModel;
        }

        [HttpGet]
        [Route("api/Report/FeedbackReport")]
        public FeedbackReportModel FeedbackReport()
        {
            FeedbackReportModel feedbackReport = new FeedbackReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    feedbackReport.FeedbackRows = db.FeedbackReport.ToList();
                    feedbackReport.Total = db.FeedbackReport.Count();
                    feedbackReport.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                feedbackReport.Success = Helpers.ErrorDetails(ex);
            }
            return feedbackReport;
        }

        [HttpGet]
        [Route("api/Report/ErrorLogReport")]
        public ErrorLogReportModel ErrorLogReport()
        {
            ErrorLogReportModel errorLog = new ErrorLogReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    errorLog.ErrorRows = db.VwErrorReportRows.ToList();
                    errorLog.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                errorLog.Success = Helpers.ErrorDetails(ex);
            }
            return errorLog;
        }

        //public string ProcessStatus { get; set; }
        //[HttpGet]
        //[Route("api/Report/Poll")]
        //public string Poll()
        //{
        //    return ProcessStatus;
        //}

        [HttpGet]
        [Route("api/Report/UserDetails")]
        public UserReportSuccessModel UserDetails(string ipAddress)
        {
            var userReportSuccessModel = new UserReportSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    userReportSuccessModel.UserReport = db.Database.SqlQuery<UserReportModel>("select IpAddress, City, Region, Country, convert(date(InitialVisit), char) 'InitialVisit'," +
                    "(select count(*) from OggleBooble.Visit where VisitorId = v.VisitorId) 'Visits'," +
                    "(select count(*) from OggleBooble.PageHit where VisitorId = v.VisitorId) 'PageHits'," +
                    "(select count(*) from OggleBooble.ImageHit where VisitorId = v.VisitorId) 'ImageHits', r.UserName " +
                    "from OggleBooble.Visitor v left join OggleBooble.RegisteredUser r on v.VisitorId = r.VisitorId " +
                    " where IpAddress = @ipAddress;", new MySql.Data.MySqlClient.MySqlParameter("@ipAddress", ipAddress)).First<UserReportModel>();
                    userReportSuccessModel.Success = "ok";
                }
            }
            catch (Exception ex) { userReportSuccessModel.Success = Helpers.ErrorDetails(ex); }
            return userReportSuccessModel;
        }

        [HttpGet]
        [Route("api/Report/UserErrorDetails")]
        public UserErrorReportSuccess UserErrorDetails(string ipAddress)
        {
            var userErrors = new UserErrorReportSuccess();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    userErrors.ErrorRows = db.VwErrorReportRows.Where(e => e.IpAddress == ipAddress).ToList();
                }
                userErrors.Success = "ok";
            }
            catch (Exception ex) { userErrors.Success = Helpers.ErrorDetails(ex); }
            return userErrors;
        }

        [HttpGet]
        [Route("api/Report/ImpactReport")]
        public ImpactReportModel ImpactReport()
        {
            ImpactReportModel impactReportModel = new ImpactReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    impactReportModel.ImpactRows = db.VwImpacts.ToList();
                }
                impactReportModel.Success = "ok";
            }
            catch (Exception ex) { impactReportModel.Success = Helpers.ErrorDetails(ex); }
            return impactReportModel;
        }

        [Route("api/Report/PlayboyList")]
        public PlayboyReportModel PlayboyList()
        {
            PlayboyReportModel centerfoldReport = new PlayboyReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbCenterfolds = db.Centerfolds.ToList();
                    centerfoldReport.Success = "ok";
                }
            }


            //foreach (Centerfold centerfold in dbCenterfolds)
            //{
            //    centerfoldReport.PlayboyReportItems.Add(new PlayboyReportItemModel()
            //    {
            //        FolderId = centerfold.FolderId,
            //        FolderName = centerfold.FolderName,
            //        FolderDecade = centerfold.FolderDecade,
            //        FolderYear = centerfold.FolderYear,
            //        FolderMonth = centerfold.FolderMonth,
            //        ImageSrc = centerfold.ImageSrc,
            //        StaticFile = centerfold.StaticFile
            //    });
            //}

            //string writeToDiskSuccess = WriteFileToDisk(staticContent.ToString(), dbFolder.FolderName, folderId, db);
            //if (writeToDiskSuccess != "ok")
            //{
            //    resultsModel.Errors.Add(writeToDiskSuccess + "  " + dbFolder.FolderName);
            //    resultsModel.Success = writeToDiskSuccess + "  " + dbFolder.FolderName;
            //}
            //else
            //    resultsModel.PagesCreated++;


            //db.Centerfolds.Add(new Centerfold()
            //{
            //    FolderId = dbPlaymate.Id,
            //    FolderName = dbPlaymate.FolderName,
            //    FolderDecade = dbPlayboyDecade.FolderName,
            //    FolderYear = dbPlayboyYear.FolderName,
            //    FolderMonth = dbPlaymate.SortOrder,
            //    StaticFile = staticFile,
            //    ImageSrc = imgSrc
            //});
            //db.SaveChanges();
            catch (Exception ex)
            {
                centerfoldReport.Success = Helpers.ErrorDetails(ex);
            }
            return centerfoldReport;
        }


        [HttpPut]
        public string PlayboyPlusDupeCheck()
        {
            string success;
            try
            {
                string localRepoPath = "F:/Danni/img/";
                using (var db = new OggleBoobleMySqlContext())
                {
                    var myDupes = db.PlayboyPlusDupes.OrderBy(p => p.PGroup).ToList();
                    int MaxPGroup = db.PlayboyPlusDupes.Max(p => p.PGroup);
                    int pGroup = 0;

                    PlayboyPlusDupe maxImageSizeItem = null;
                    List<PlayboyPlusDupe> dupGroup = null;
                    LinksController linksController = new LinksController();
                    string fileName, folderPath, localPath;
                    while (pGroup < MaxPGroup)
                    {
                        dupGroup = myDupes.Where(d => d.PGroup == pGroup).ToList();
                        if (dupGroup.Count > 1)
                        {
                            maxImageSizeItem = dupGroup.Aggregate((i1, i2) => i1.FSize > i2.FSize ? i1 : i2);
                            foreach (PlayboyPlusDupe smallerDupeImage in dupGroup)
                            {
                                if (smallerDupeImage.Pk != maxImageSizeItem.Pk)
                                {
                                    string isOk = linksController.MoveLink(maxImageSizeItem.FileId, smallerDupeImage.FolderId, "archive");
                                    if (isOk == "ok")
                                    {
                                        fileName = db.ImageFiles.Where(i => i.Id == smallerDupeImage.FileId).FirstOrDefault().FileName;
                                        folderPath = db.CategoryFolders.Where(f => f.Id == smallerDupeImage.FolderId).FirstOrDefault().FolderPath;
                                        try
                                        {
                                            localPath = localRepoPath + folderPath + "/" + fileName;
                                            if (File.Exists(localPath))
                                            {
                                                File.Delete(localPath);
                                            }
                                        }
                                        catch (Exception ex)
                                        {
                                            string err = Helpers.ErrorDetails(ex);
                                        }
                                    }
                                }
                            }
                        }
                        pGroup++;
                    }
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
        public string RegularDupeCheck()
        {
            string success;
            try
            {
                string localRepoPath = "F:/Danni/img/";
                using (var db = new OggleBoobleMySqlContext())
                {
                    var myDupes = db.PlayboyPlusDupes.OrderBy(p => p.PGroup).ToList();
                    int MaxPGroup = db.PlayboyPlusDupes.Max(p => p.PGroup);
                    int pGroup = 0;

                    PlayboyPlusDupe maxImageSizeItem = null;
                    List<PlayboyPlusDupe> dupGroup = null;
                    string fileName, folderPath, localPath;
                    ImageFile dupeImage = null;

                    while (pGroup < MaxPGroup)
                    {
                        dupGroup = myDupes.Where(d => d.PGroup == pGroup).ToList();
                        if (dupGroup.Count > 1)
                        {
                            maxImageSizeItem = dupGroup.Aggregate((i1, i2) => i1.FSize > i2.FSize ? i1 : i2);
                            var dbMaxImageSizeItem = db.ImageFiles.Where(i => i.Id == maxImageSizeItem.FileId).FirstOrDefault();
                            foreach (PlayboyPlusDupe smallerDupeImage in dupGroup)
                            {
                                if (smallerDupeImage.Pk != maxImageSizeItem.Pk)
                                {
                                    if (smallerDupeImage.FolderId == maxImageSizeItem.FolderId)
                                    {
                                        var dupeLinks = db.CategoryImageLinks.Where(l => l.ImageLinkId == smallerDupeImage.FileId).ToList();
                                        foreach (CategoryImageLink dupeLink in dupeLinks)
                                        {
                                            if (dupeLink.ImageCategoryId == maxImageSizeItem.FolderId)
                                            {
                                                db.CategoryImageLinks.Remove(dupeLink);
                                            }
                                            else
                                            {
                                                dupeLink.ImageLinkId = maxImageSizeItem.FileId;
                                            }
                                        }
                                        dupeImage = db.ImageFiles.Where(i => i.Id == smallerDupeImage.FileId).FirstOrDefault();
                                        if (dupeImage != null)
                                            if (dbMaxImageSizeItem.ExternalLink == "?")
                                            {
                                                dbMaxImageSizeItem.ExternalLink = dupeImage.ExternalLink;
                                            }
                                        db.ImageFiles.Remove(dupeImage);
                                        db.SaveChanges();

                                        //string isOk = linksController.MoveLink(maxImageSizeItem.FileId, smallerDupeImage.FolderId, "archive");
                                        fileName = db.ImageFiles.Where(i => i.Id == smallerDupeImage.FileId).FirstOrDefault().FileName;
                                        folderPath = db.CategoryFolders.Where(f => f.Id == smallerDupeImage.FolderId).FirstOrDefault().FolderPath;
                                        try
                                        {
                                            localPath = localRepoPath + folderPath + "/" + fileName;
                                            if (File.Exists(localPath))
                                            {
                                                File.Delete(localPath);
                                            }
                                        }
                                        catch (Exception ex)
                                        {
                                            string err = Helpers.ErrorDetails(ex);
                                        }
                                    }
                                    else {
                                        success = "here we got to do a archive?";                                    
                                    }
                                }
                            }
                        }
                        pGroup++;
                    }
                }
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }
        public string MySnippet()
        {
            string success;
            try
            {
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
    public class HtmlPageController : ApiController
    {
        private readonly string httpLocation = "https://ogglebooble.com/";
        //private readonly string imagesLocation = "https://api.ogglebooble.com/";
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        private readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        private readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        private readonly string imgRepo = ConfigurationManager.AppSettings["ImageRepository"];

        [HttpPost]
        public string Build(int rootFolder)
        {
            string success;
            try
            {
                var stringBuilder = new StringBuilder("<html><head>");

                stringBuilder.Append("</head>\n<body>\n");
                string fileName;
                using (var db = new OggleBoobleMySqlContext())
                {
                    //string imgSrc;
                    //ImageFile dbImageFile;
                    var dbParentFolder = db.CategoryFolders.Where(f => f.Id == rootFolder).First();
                    fileName = dbParentFolder.FolderName + ".html";
                    //if (dbParentFolder.FolderType == "singleChild")
                    if (new string[] { "singleChild", "multiModel" }.Any(s => dbParentFolder.FolderType.Contains(s)))
                    {
                        // create a trackback static page
                    }
                    if (dbParentFolder.FolderType == "singleParent")
                    {
                        // create a trackback static page
                    }

                    if (dbParentFolder.FolderType == "multiFolder")
                    {
                        var sub1Folders = db.CategoryFolders.Where(f => f.Parent == rootFolder).ToList();
                        foreach (CategoryFolder sub1Folder in sub1Folders)
                        {
                            // show playboy decade 
                            if (sub1Folder.FolderType == "multiFolder")
                            {
                                stringBuilder.Append("\n<H2>" + sub1Folder.FolderName + "</H2>\n");
                                var sub2Folders = db.CategoryFolders.Where(f => f.Parent == sub1Folder.Id).ToList();
                                foreach (CategoryFolder sub2Folder in sub2Folders)
                                {
                                    // playboy year
                                    if (sub2Folder.FolderType == "multiFolder")
                                    {
                                        stringBuilder.Append("\n<H3>" + sub2Folder.FolderName + "</H3>\n");
                                        var sub3Folders = db.CategoryFolders.Where(f => f.Parent == sub2Folder.Id).ToList();
                                        stringBuilder.Append("<div class='pbYearRow'>\n");
                                        foreach (CategoryFolder sub3Folder in sub3Folders)
                                        {
                                            // show playboy month
                                            //if (sub3Folder.FolderType == "multiFolder")
                                            {
                                                var sub4Folders = db.CategoryFolders.Where(f => f.Parent == sub3Folder.Id).ToList();
                                                foreach (CategoryFolder sub4Folder in sub3Folders)
                                                {
                                                    ImageFile dbImageFile = db.ImageFiles.Where(i => i.Id == sub4Folder.FolderImage).First();
                                                    stringBuilder.Append("<div><img src='" + imgRepo + "/" +
                                                        db.CategoryFolders.Where(f => f.Id == dbImageFile.FolderId).First().FolderPath + "/" + dbImageFile.FileName + "'/>\n");
                                                    stringBuilder.Append("<br/>" + sub4Folder.FolderName + "</div>\n");
                                                }
                                                stringBuilder.Append("</div>");
                                            }
                                        }
                                    }
                                    else
                                    {
                                        ImageFile dbImageFile = db.ImageFiles.Where(i => i.Id == sub2Folder.FolderImage).First();
                                        stringBuilder.Append("<div><img src='" + imgRepo + "/" +
                                            db.CategoryFolders.Where(f => f.Id == dbImageFile.FolderId).First().FolderPath + "/" + dbImageFile.FileName + "'/>\n");
                                        stringBuilder.Append("<br/>" + sub2Folder.FolderName + "</div>\n");
                                    }
                                }
                            }
                            else
                            {
                                ImageFile dbImageFile = db.ImageFiles.Where(i => i.Id == sub1Folder.FolderImage).First();
                                stringBuilder.Append("<div><img src='" + imgRepo + "/" +
                                    db.CategoryFolders.Where(f => f.Id == dbImageFile.FolderId).First().FolderPath + "/" + dbImageFile.FileName + "'/>\n");
                                stringBuilder.Append("<br/>" + sub1Folder.FolderName + "</div>\n");
                            }
                        }
                    }
                    //stringBuilder.Append("\n<style>\n" +
                    //    ".pbDecade { margin - left: 20px; font-family: 'Segoe UI', Tahoma; font-size: 35px; }\n" +
                    //    ".pbYear { margin - left: 80px; color:#000; font-size: 30px;}\n" +
                    //    ".pbMonth { margin - left: 40px; font-size: 20px; }\n" +
                    //    ".pbRow { display: flex; }\n" +
                    //    ".pbCol { display: inline - block; margin-left: 60px; }\n" +
                    //    ".pbItemCntr { display: inline-block; }\n" +
                    //    ".pbImg { height: 45px; }\n</style>\n");
                    {
                        //monthIncimentor = 0;
                        //stringBuilder.Append("<div class='pbDecade'>" + dbPlayboyDecade.FolderName + "</div>\n");
                        //var dbPlayboyYears = db.CategoryFolders.Where(f => f.Parent == dbPlayboyDecade.Id).OrderBy(f => f.SortOrder).ToList();
                        //foreach (var dbPlayboyYear in dbPlayboyYears)
                        //{
                        //    //hub.SendMessage("xx", dbPlayboyYear.FolderName);
                        //    stringBuilder.Append("<div class='pbYear'>" + dbPlayboyYear.FolderName + "</div>\n");
                        //    var dbPlayboyMonths = db.CategoryFolders.Where(f => f.Parent == dbPlayboyYear.Id).OrderBy(f => f.SortOrder).ToList();
                        //    stringBuilder.Append("<div class='pbRow'>");
                        //    foreach (CategoryFolder dbPbmonth in dbPlayboyMonths)
                        //    {
                        //        //ProcessStatus = dbPlayboyYear.FolderName + " " + ++monthIncimentor + " " + dbPbmonth.FolderName;
                        //        imgSrc = "Images/redballon.png";
                        //        if (dbPbmonth.FolderImage != null)
                        //        {
                        //            dbImageFile = db.ImageFiles.Where(i => i.Id == dbPbmonth.FolderImage).FirstOrDefault();
                        //            if (dbImageFile != null)
                        //                imgSrc = dbPbmonth.FolderPath + "/" + dbImageFile.FileName;
                        //        }
                        //        stringBuilder.Append(
                        //            "<div class='pbCol' style='width:66px;'>" +
                        //            //" onmouseover='showCenterfoldImage(\"" + imgSrc + "\")'" +
                        //            //" onmouseout=\"$('.dirTreeImageContainer').hide()\">" +
                        //            "   <a href='" + httpLocation + "/album.html?folder=" + dbPbmonth.Id + "'>" +
                        //            "       <img class='pbImg' src='" + imagesLocation + imgSrc + "'>" +
                        //            "       <div class='pbLabel01'>" + dbPbmonth.FolderName + "</div>\n" +
                        //            "   </a>" +
                        //            "</div>\n");
                        //    }
                        //    stringBuilder.Append("</div>\n");
                        //}
                        //stringBuilder.Append("</div>\n");
                    }
                }

                //stringBuilder.Append("<script>\nfunction showCenterfoldImage(link)\n {" +
                //    "$('.dirTreeImageContainer').css('top', event.clientY - 100);\n" +
                //    "$('.dirTreeImageContainer').css('left', event.clientX + 10);\n" +
                //    "$('.dirTreeImage').attr('src', link);\n" +
                //    "$('.dirTreeImageContainer').show();}\n</script>");

                //$('#footerMessage').html(link);
                stringBuilder.Append("\n</body>\n</html>");

                success = WriteFileToDisk(stringBuilder.ToString(), fileName);
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        private string WriteFileToDisk(string staticContent, string pageTitle)
        {
            string success;
            try
            {
                // todo  write the image as a file to x.ogglebooble  4/1/19
                //string tempFilePath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data");
                string appDataPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/temp/");

                using (var staticFile = File.Open(appDataPath + "/temp.html", FileMode.Create))
                {
                    Byte[] byteArray = Encoding.ASCII.GetBytes(staticContent);
                    staticFile.Write(byteArray, 0, byteArray.Length);
                }
                FtpWebRequest webRequest = null;
                //string ftpPath = ftpHost + "/pages.OGGLEBOOBLE.COM/";

                string ftpFileName = ftpHost + "ogglebooble/static/" + pageTitle;
                string httpFileName = httpLocation + pageTitle;

                webRequest = (FtpWebRequest)WebRequest.Create(ftpFileName);
                webRequest.Credentials = new NetworkCredential(ftpUserName, ftpPassword);
                webRequest.Method = WebRequestMethods.Ftp.UploadFile;
                using (Stream requestStream = webRequest.GetRequestStream())
                {
                    byte[] fileContents = File.ReadAllBytes(appDataPath + "/temp.html");
                    webRequest.ContentLength = fileContents.Length;
                    requestStream.Write(fileContents, 0, fileContents.Length);
                    requestStream.Flush();
                    requestStream.Close();
                }

                //success = RecordPageCreation(folderId, httpFileName, db);
                success = "ok";
            }
            catch (Exception e) { success = Helpers.ErrorDetails(e); }
            return success;
        }
    }


    [EnableCors("*", "*", "*")]
    public class PdfController : ApiController
    {
        [HttpGet]
        [Route("api/Pdf/RipPdf")]
        public string RipPdf(string sourceFile, string destinationPath)
        {
            string success;
            int pdfPageCount, startPageNumber = 1, endPageNumber = 100;
            try
            {
                using (PdfDocument pdf = PdfDocument.FromFile(sourceFile))
                {
                    pdfPageCount = pdf.PageCount - 2;
                }
                DirectoryInfo dirInfo = new DirectoryInfo(destinationPath);
                if (!dirInfo.Exists)
                    dirInfo.Create();

                while (startPageNumber < pdfPageCount)
                {
                    success = RipSegment(sourceFile, destinationPath, Enumerable.Range(startPageNumber, endPageNumber));
                    startPageNumber += endPageNumber;
                    endPageNumber += 100;
                }
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpGet]
        [Route("api/Pdf/RipPdfRange")]
        public string RipPdfRange(string sourceFile, string destinationPath, int startPage, int endPage)
        {
            string success;
            try
            {
                DirectoryInfo dirInfo = new DirectoryInfo(destinationPath);
                if (!dirInfo.Exists)
                    dirInfo.Create();

                success = RipSegment(sourceFile, destinationPath, Enumerable.Range(startPage, endPage));
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        private string RipSegment(string sourceFile, string destinationPath, IEnumerable<int> pageNumbers)
        {
            string success;
            try
            {
                PdfDocument pdf = PdfDocument.FromFile(sourceFile);
                try
                {
                    pdf.RasterizeToImageFiles(destinationPath, pageNumbers, 450, 800, ImageType.Jpeg);
                    pdf.Dispose();
                    pdf = null;
                    success = "ok";
                }
                catch (Exception ex)
                {
                    success = Helpers.ErrorDetails(ex);
                    pdf.Dispose();
                    pdf = null;
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
    public class XhampsterController : ApiController
    {
        private readonly string imgRepo = ConfigurationManager.AppSettings["ImageRepository"];

        [HttpPost]
        public string Create(int folderId)
        {
            string success = "";
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    string folderName = db.CategoryFolders.Where(f => f.Id == folderId).Select(f => f.FolderName).First();

                    List<string> fileNames = (from i in db.CategoryImageLinks
                                          join g in db.ImageFiles on i.ImageLinkId equals g.Id
                                          join f in db.CategoryFolders on g.FolderId equals f.Id
                                          where i.ImageCategoryId == folderId
                                          orderby i.SortOrder
                                          select f.FolderPath + "/" + g.FileName).ToList();
                    //List<string> links = db.CategoryImageLinks
                    //    .Where(l => l.ImageCategoryId == folderId)
                    //    .OrderBy(l => l.SortOrder)
                    //    .Select(l => l.ImageLinkId).ToList();


                    string destinationFolder = System.Web.HttpContext.Current.Server.MapPath("~/app_data/xhampster/");
                    DirectoryInfo dirInfo = new DirectoryInfo(destinationFolder);
                    foreach (FileInfo file in dirInfo.GetFiles())
                    {
                        file.Delete();
                    }
                    using (WebClient wc = new WebClient())
                    {
                        try
                        {
                            int k = 0;
                            string xFileName = "";
                            foreach (string fileName in fileNames)
                            {
                                xFileName = destinationFolder + folderName + "_" + string.Format("{0:0000}", ++k) + fileName.Substring(fileName.LastIndexOf("."));
                                wc.DownloadFile(new Uri(imgRepo + "/" + fileName), xFileName);
                            }
                            success = "ok";
                        }
                        catch (Exception ex)
                        {
                            success = ex.Message;
                        }
                    }
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

