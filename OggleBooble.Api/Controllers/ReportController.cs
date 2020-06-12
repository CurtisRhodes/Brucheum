using OggleBooble.Api.Models;
using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class ReportController : ApiController
    {
        [HttpGet]
        [Route("api/Report/MetricMatrixReport")]
        public MetricsMatrixResults MetricsMatrixReport()
        {
            var metricsMatrixResults = new MetricsMatrixResults();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.PageHits.RemoveRange(db.PageHits.Where(h => h.VisitorId == "ec6fb880-ddc2-4375-8237-021732907510"));
                    db.ImageHits.RemoveRange(db.ImageHits.Where(i => i.VisitorId == "ec6fb880-ddc2-4375-8237-021732907510"));
                    db.SaveChanges();
                    //VwPageHit vwPageHit = dbm.VwPageHits.FirstOrDefault();
                    List<MetricsMatrix> matrices = db.VwMetricsMatrices.ToList();
                    foreach (MetricsMatrix matrix in matrices)
                    {
                        metricsMatrixResults.MatrixRows.Add(new MatrixRowModel()
                        {
                            Column = matrix.Column,
                            Today = matrix.Today,
                            Yesterday = matrix.Yesterday,
                            Two_Days_ago = matrix.Two_Days_ago,
                            Three_Days_ago = matrix.Three_Days_ago,
                            Four_Days_ago = matrix.Four_Days_ago,
                            Five_Days_ago = matrix.Five_Days_ago,
                            Six_Days_ago = matrix.Six_Days_ago
                        });
                    }

                    metricsMatrixResults.Success = "ok";
                }
            }
            catch (Exception ex) { metricsMatrixResults.Success = Helpers.ErrorDetails(ex); }
            return metricsMatrixResults;
        }

        [HttpGet]
        [Route("api/Report/MostVisitedPagesReport")]
        public MostPopularPagesReportModel MostVisitedPagesReport()
        {
            var mostPopularPages = new MostPopularPagesReportModel();
            try
            {
                using (var db = new OggleBoobleMySqContext())
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

                    List<vwImageHit> imageHits = db.vwImageHits.ToList();
                    foreach (vwImageHit imageHit in imageHits)
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
        [Route("api/Report/ActivityReport")]
        public ActivityReportModel ActivityReport()
        {
            var activityReport = new ActivityReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.EventLogs.RemoveRange(db.EventLogs.Where(e => e.VisitorId == "ec6fb880-ddc2-4375-8237-021732907510"));
                    db.SaveChanges();
                    List<DailyActivityReport> activityItems = db.DailyActivity.ToList();
                    foreach (var activityItem in activityItems)
                    {
                        activityReport.Items.Add(new ActiviyItem()
                        {
                            IpAddress = activityItem.IpAddress,
                            City = activityItem.City,
                            Region = activityItem.Region,
                            Country = activityItem.Country,
                            Event = activityItem.Event,
                            CalledFrom = activityItem.CalledFrom,
                            Detail = activityItem.Detail,
                            HitDate = activityItem.HitDate,
                            HitTime = activityItem.HitTime
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
                    foreach (vwMostActiveUsersForToday mostActiveUserItem in mostActiveUserItems)
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
                    List<vwPageHit> vwPageHits = db.vwPageHits.Take(500).ToList();

                    pageHitReportModel.HitCount = db.PageHits.Count();

                    foreach (vwPageHit item in vwPageHits)
                    {
                        pageHitReportModel.Items.Add(new PageHitReportModelItem()
                        {
                            IpAddress = item.IpAddress,
                            City = item.City,
                            Region = item.Region,
                            Country = item.Country,
                            PageId = item.PageId,
                            FolderName = item.FolderName, // ?? "?",item.FolderName.Replace("OGGLEBOOBLE.COM", ""),
                            PageHits = item.PageHits,
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
                    feedbackReport.FeedbackRows =
                        (from f in db.FeedBacks
                         join v in db.Visitors on f.VisitorId equals v.VisitorId
                         join c in db.CategoryFolders on f.PageId equals c.Id
                         join p in db.CategoryFolders on c.Parent equals p.Id
                         join r in db.RegisteredUsers on f.VisitorId equals r.VisitorId into sr
                         from u in sr.DefaultIfEmpty()
                         where (v.IpAddress != "68.203.90.183")
                         select new FeedbackModel()
                         {
                             IpAddress = v.IpAddress,
                             Parent = p.FolderName,
                             Folder = c.FolderName,
                             FeedBackType = f.FeedBackType,
                             Occured = f.Occured,
                             FeedBackComment = f.FeedBackComment,
                             UserName = u.UserName == null ? "unregistered" : u.UserName,
                             Email = u.Email == null ? "" : u.Email
                         }).OrderByDescending(f => f.Occured).ToList();
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
                    errorLog.ErrorRows = db.vwErrorReportRows.ToList();
                    //(from e in mdb.ErrorLogItems
                    // join v in mdb.Visitors on e.VisitorId equals v.VisitorId
                    // select new ErrorLogItem()
                    // {
                    //     VisitorId = v.VisitorId,
                    //     City = v.City,
                    //     Country = v.Country,
                    //     CalledFrom = e.CalledFrom,
                    //     ActivityCode = e.ActivityCode,
                    //     Severity = e.Severity,
                    //     Occured = e.Occured,
                    //     At = e.Occured.ToShortDateString(),
                    //     On = e.Occured.AddHours(2).ToShortTimeString(),
                    //     ErrorMessage = e.ErrorMessage
                    // }).OrderByDescending(e => e.Occured).Take(500).ToList();

                    errorLog.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                errorLog.Success = Helpers.ErrorDetails(ex);
            }
            return errorLog;
        }
    }
}
