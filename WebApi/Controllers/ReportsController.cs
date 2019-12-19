using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.DataContext;
using WebApi.Models;
using WebApi.MySqDataContext;

namespace WebApi.Controllers
{
    [EnableCors("*", "*", "*")]
    public class ReportsController : ApiController
    {
        [HttpGet]
        [Route("api/Reports/MetricsMatrixReport")]
        public MetricsMatrixReport MetricsMatrixReport()
        {
            MetricsMatrixReport metricsMatrixReport = new MetricsMatrixReport();
            try
            {
                using (OggleBoobleMySqContext db = new OggleBoobleMySqContext())
                {
                    db.PageHits.RemoveRange(db.PageHits.Where(h => h.VisitorId == "ec6fb880-ddc2-4375-8237-021732907510"));
                    db.ImageHits.RemoveRange(db.ImageHits.Where(i => i.VisitorId == "ec6fb880-ddc2-4375-8237-021732907510"));
                    //VwPageHit vwPageHit = dbm.VwPageHits.FirstOrDefault();
                    List<MetricsMatrix> matrices = db.VwMetricsMatrices.ToList();
                    foreach (MetricsMatrix matrix in matrices)
                    {
                        metricsMatrixReport.MatrixRows.Add(new MatrixRowModel()
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

                    metricsMatrixReport.Success = "ok";
                }
            }
            catch (Exception ex) { metricsMatrixReport.Success = Helpers.ErrorDetails(ex); }
            return metricsMatrixReport;
        }

        [HttpGet]
        [Route("api/Reports/MostVisitedPagesReport")]
        public MostPopularPagesReportModel MostVisitedPagesReport()
        {
            var mostPopularPages = new MostPopularPagesReportModel();
            try
            {
                using (var db = new OggleBoobleMySqContext())
                {
                    mostPopularPages.Items = db.Database.SqlQuery<MostPopularPagesReportItem>(
                         "select FolderName PageName, count(*) PageHits " +
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
        [Route("api/Reports/MostImageHitsReport")]
        public MostPopularPagesReportModel MostImageHitsReport()
        {
            var MostImageHits = new MostPopularPagesReportModel();
            try
            {
                using (var db = new OggleBoobleMySqContext())
                {
                    // select * from OggleBooble.vwImageHitsForToday;

                    MostImageHits.Items = db.Database.SqlQuery<MostPopularPagesReportItem>(
                        "select FolderName PageName, count(*) PageHits " +
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
        [Route("api/Reports/LatestImageHits")]
        public LatestImageHitsReportModel LatestImageHits()
        {
            var imageHitsReportModel = new LatestImageHitsReportModel();
            try
            {
                using (var db = new OggleBoobleMySqContext())
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
        [Route("api/Reports/ActivityReport")]
        public ActivityReportModel ActivityReport()
        {
            var activityReport = new ActivityReportModel();
            try
            {
                using (var db = new OggleBoobleMySqContext())
                {
                    db.EventLogs.RemoveRange(db.EventLogs.Where(e => e.VisitorId == "ec6fb880-ddc2-4375-8237-021732907510"));

                    var activityItems = db.vwDailyActivities.Distinct().ToList();
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
        [Route("api/Reports/MostActiveUsersReport")]
        public MostActiveUsersModel MostActiveUsersReport()
        {
            var mostActiveUsersReport = new MostActiveUsersModel();
            try
            {
                using (var db = new OggleBoobleMySqContext())
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
                            LastHit = mostActiveUserItem.LastHit,
                            ImageHits = mostActiveUserItem.ImageHits
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
        [Route("api/Reports/PageHitReport")]
        public PageHitReportModel PageHitReport()
        {
            var pageHitReportModel = new PageHitReportModel();
            int errCount = 0;
            try
            {
                using (var db = new OggleBoobleMySqContext())
                {
                    db.PageHits.RemoveRange(db.PageHits.Where(h => h.VisitorId == "ec6fb880-ddc2-4375-8237-021732907510"));

                    var pageHits = db.vwPageHits.ToList();
                    pageHitReportModel.HitCount = pageHits.Count();
                    foreach (vwPageHit item in pageHits)
                    {
                        try
                        {
                            pageHitReportModel.Items.Add(new PageHitReportModelItem()
                            {
                                IpAddress = item.IpAddress,
                                City = item.City,
                                Region = item.Region,
                                Country = item.Country,
                                PageId = item.PageId,
                                FolderName = item.FolderName.Replace("OGGLEBOOBLE.COM", ""),
                                HitDate = item.HitDate,
                                HitTime = item.HitTime
                            });
                        }
                        catch (Exception) { errCount++; }
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
    }
}
