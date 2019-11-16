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
                    var qry = from h in db.PageHits
                            join f in db.CategoryFolders on h.PageId equals f.Id
                            group h by f.FolderName into grp
                            select new
                            {
                                FolderName = grp.Key,
                                Count = grp.Select(x => x.PageId).Distinct().Count()
                            };

                    //for (int i = 0; i < 100; i++) { }
                    int i = 0;
                    foreach (var xrow in qry.OrderBy(x => x.Count))
                    {
                        mostPopularPages.Items.Add(new MostPopularPagesReportItem()
                        { PageName = xrow.FolderName, PageHits = xrow.Count });
                        if (i++ > 200)
                            break;
                    }
                }
                mostPopularPages.Success = "ok";
            }
            catch (Exception ex) { mostPopularPages.Success = Helpers.ErrorDetails(ex); }
            return mostPopularPages;
        }
    }
}
