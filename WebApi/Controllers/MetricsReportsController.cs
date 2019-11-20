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
                         "where HitTimeStamp between date_add(current_date(), interval -1 day) and current_date()" +
                         "group by PageId " +
                         "order by PageHits desc limit 200").ToList();

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
                    MostImageHits.Items = db.Database.SqlQuery<MostPopularPagesReportItem>(
                        "select FolderName PageName, count(*) PageHits " +
                        "from OggleBooble.ImageHit h " +
                        "join OggleBooble.CategoryFolder f on h.PageId = f.Id " +
                        "where HitDateTime between date_add(current_date(), interval - 1 day) and current_date() " +
                        "group by PageId order by PageHits desc limit 200").ToList();
                }
                MostImageHits.Success = "ok";
            }
            catch (Exception ex) { MostImageHits.Success = Helpers.ErrorDetails(ex); }
            return MostImageHits;
        }
    }
}
