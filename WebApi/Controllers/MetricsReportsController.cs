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
        public PageHitModel Report1(int pageId)
        {
            PageHitModel pageHitModel = new PageHitModel();
            try
            {
                using (OggleBoobleMySqContext dbm = new OggleBoobleMySqContext())
                {
                    VwPageHit vwPageHit = dbm.VwPageHits.FirstOrDefault();
                    pageHitModel.Today = vwPageHit.Today;
                    pageHitModel.Yesterday = vwPageHit.Yesterday;
                    pageHitModel.Two_Days_ago = vwPageHit.Two_Days_ago;
                    pageHitModel.Three_Days_ago = vwPageHit.Three_Days_ago;
                    pageHitModel.Four_Days_ago = vwPageHit.Four_Days_ago;
                    pageHitModel.Five_Days_ago = vwPageHit.Five_Days_ago;
                    pageHitModel.Six_Days_ago = vwPageHit.Six_Days_ago;
                    pageHitModel.Success = "ok";
                }
            }
            catch (Exception ex) { pageHitModel.Success = Helpers.ErrorDetails(ex); }
            return pageHitModel;
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
