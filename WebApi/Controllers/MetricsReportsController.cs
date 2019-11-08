using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.DataContext;
using WebApi.Models;

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


        [HttpPost]
        public string LogActivity(ChangeLogModel changeLog)
        {
            string success = "";
            try
            {
                using (WebStatsContext db = new WebStatsContext())
                {
                    ChangeLog alredyExists = db.ChangeLogs.Where(cl => cl.PageId == changeLog.PageId && cl.Activity == changeLog.Activity).FirstOrDefault();
                    if (alredyExists == null)
                    {
                        db.ChangeLogs.Add(new ChangeLog()
                        {
                            PageId = changeLog.PageId,
                            PageName = changeLog.PageName,
                            Activity = changeLog.Activity,
                            Occured = DateTime.Now
                        });
                        db.SaveChanges();
                    }
                }
                success = "ok";
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }
}
