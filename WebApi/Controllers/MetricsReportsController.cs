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
    public class MetricsReportsController : ApiController
    {
        [HttpGet]
        public DailyHitReport PageHitsReport()
        {
            DailyHitReport hitReport   = new DailyHitReport();
            try
            {
                using (OggleBoobleMySqContext dbm = new OggleBoobleMySqContext())
                {
                    VwPageHit vwPageHit = dbm.VwPageHits.FirstOrDefault();
                    hitReport.PageHits.Today = vwPageHit.Today;
                    hitReport.PageHits.Yesterday = vwPageHit.Yesterday;
                    hitReport.PageHits.Two_Days_ago = vwPageHit.Two_Days_ago;
                    hitReport.PageHits.Three_Days_ago = vwPageHit.Three_Days_ago;
                    hitReport.PageHits.Four_Days_ago = vwPageHit.Four_Days_ago;
                    hitReport.PageHits.Five_Days_ago = vwPageHit.Five_Days_ago;
                    hitReport.PageHits.Six_Days_ago = vwPageHit.Six_Days_ago;

                    VwImageHit vwImageHit = dbm.VwImageHits.FirstOrDefault();
                    hitReport.ImageHits.Today = vwImageHit.Today;
                    hitReport.ImageHits.Yesterday = vwImageHit.Yesterday;
                    hitReport.ImageHits.Two_Days_ago = vwImageHit.Two_Days_ago;
                    hitReport.ImageHits.Three_Days_ago = vwImageHit.Three_Days_ago;
                    hitReport.ImageHits.Four_Days_ago = vwImageHit.Four_Days_ago;
                    hitReport.ImageHits.Five_Days_ago = vwImageHit.Five_Days_ago;
                    hitReport.ImageHits.Six_Days_ago = vwImageHit.Six_Days_ago;
                    hitReport.Success = "ok";
                }
            }
            catch (Exception ex) { hitReport.Success = Helpers.ErrorDetails(ex); }
            return hitReport;
        }

        [HttpGet]
        [Route("api/MetricsReports/MostVisitedPagesReport")]
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
        [Route("api/MetricsReports/MostImageHitsReport")]
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
        [Route("api/MetricsReports/ImageHitActivityReport")]
        public ImageHitActivityReportModel ImageHitActivityReport()
        {
            var activityReport = new ImageHitActivityReportModel();
            try
            {
                using (var db = new OggleBoobleMySqContext())
                {
                    activityReport.Items = db.Database.SqlQuery<ImageHitActivityReportItem>(
                        "select IpAddress, City, Region, Country, PageId, ImageLinkId, "+
                        "date_format(HitDateTime, '%m/%d/%Y') as hitDate, date_format(HitDateTime, '%h:%i.%s') as hitTime " +
                        "from OggleBooble.ImageHit ih " +
                        "join OggleBooble.Visitor v on ih.VisitorId = v.VisitorId " +
                        "where ih.HitDateTime between current_date and current_date + 1 " +
                        "order by hitTime desc, IpAddress limit 500").ToList();

                    activityReport.HitCount = db.ImageHits.Where(h => h.HitDateTime > DateTime.Today).Count();
                }
                activityReport.Success = "ok";
            }
            catch (Exception ex) { activityReport.Success = Helpers.ErrorDetails(ex); }
            return activityReport;
        }

        [HttpGet]
        [Route("api/MetricsReports/ActivityReport")]
        public ActivityReportModel ActivityReport()
        {
            var activityReport = new ActivityReportModel();
            try
            {
                using (var db = new OggleBoobleMySqContext())
                {
                    activityReport.Items = db.Database.SqlQuery<ActivityReportItem>(
                        " select IpAddress, City, Region, countryCode.RefDescription as Country, EventDetail, r.RefDescription, FolderName as calledFrom," +
                        " date_format(Occured, '%m/%d/%Y') as hitDate, date_format(Occured, '%h:%i.%s') as hitTime " +
                        " from OggleBooble.EventLog e" +
                        " join OggleBooble.Ref r on e.EventCode = r.RefCode" +
                        " join OggleBooble.Visitor v on e.VisitorId = v.VisitorId" +
                        " join OggleBooble.Ref countryCode on v.Country = countryCode.RefCode" +
                        " join OggleBooble.CategoryFolder f on e.PageId = f.Id" +
                        " where Occured > current_date" +
                        " order by Occured desc limit 500;").ToList();

                    activityReport.HitCount = db.ImageHits.Where(h => h.HitDateTime > DateTime.Today).Count();
                }
                activityReport.Success = "ok";
            }
            catch (Exception ex) { activityReport.Success = Helpers.ErrorDetails(ex); }
            return activityReport;
        }

        [HttpGet]
        [Route("api/MetricsReports/MostActiveUsersReport")]
        public MostActiveUsersModel MostActiveUsersReport()
        {
            var mostActiveUsersReport = new MostActiveUsersModel();
            try
            {
                using (var db = new OggleBoobleMySqContext())
                {
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
    }
}
