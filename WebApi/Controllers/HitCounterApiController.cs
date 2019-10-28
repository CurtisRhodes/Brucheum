using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Models;
using WebApi.DataContext;
using MySql.Data.Types;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class PageHitController : ApiController
    {
        [HttpPost]
        public PageHitSuccessModel LogPageHit(PageHitRequestModel pageHitModel)
        {
            PageHitSuccessModel pageHitSuccessModel = new PageHitSuccessModel();
            try
            {
                if (Helpers.IsNullorUndefined(pageHitModel.VisitorId))
                {
                    if (Helpers.IsNullorUndefined(pageHitModel.IpAddress))
                    {
                        pageHitSuccessModel.Success = "VisitorId fail";
                        return pageHitSuccessModel;
                    }
                }
                using (WebStatsContext db = new WebStatsContext())
                {
                    #region // LOG VISIT
                    DateTime lastVisitDate = DateTime.MinValue;
                    if (!Helpers.IsNullorUndefined(pageHitModel.VisitorId))
                    {
                        List<Visit> visits = db.Visits.Where(v => v.VisitorId == pageHitModel.VisitorId).ToList();
                        if (visits.Count > 0)
                            lastVisitDate = visits.OrderByDescending(v => v.VisitDate).FirstOrDefault().VisitDate;
                    }
                    else
                    {
                        IPVisitLookup iPVisitLookup = (from v in db.Visitors
                                                       join vi in db.Visits on v.VisitorId equals vi.VisitorId
                                                       select new IPVisitLookup() { VisitDate = vi.VisitDate }).OrderByDescending(v => v).FirstOrDefault();
                        lastVisitDate = iPVisitLookup.VisitDate;
                    }
                    if ((lastVisitDate == DateTime.MinValue) || ((DateTime.Now - lastVisitDate).TotalHours > 12))
                    {
                        Visitor visitor = db.Visitors.Where(v => v.VisitorId == pageHitModel.VisitorId).FirstOrDefault();
                        if (visitor != null)
                        {
                            if ((visitor.IpAddress != "68.203.90.183") && (visitor.IpAddress != "50.62.160.105"))
                            {
                                db.Visits.Add(new Visit() { VisitorId = pageHitModel.VisitorId, VisitDate = DateTime.Now });
                                db.SaveChanges();
                                if (Helpers.IsNullorUndefined(pageHitModel.UserName))
                                {
                                    pageHitSuccessModel.WelcomeMessage = "Welcome Back ";
                                }
                                else
                                {
                                    pageHitSuccessModel.WelcomeMessage = "Welcome back " + visitor.UserName;
                                }
                            }
                        }
                    }
                    #endregion
                    string pageName = "";

                    //if (pageHitModel.PageId == null) { pageHitSuccessModel.Success = "nn"; }
                    using (OggleBoobleContext odb = new OggleBoobleContext())
                    {
                        CategoryFolder categoryFolder = odb.CategoryFolders.Where(f => f.Id == pageHitModel.PageId).FirstOrDefault();
                        if (categoryFolder != null)
                            pageName = categoryFolder.FolderName;
                        else
                            pageName = "not found for " + pageHitModel.PageId;
                    }
                    //pageHitSuccessModel.PageName = pageName;

                    /// LOG PAGE HIT
                    using (OggleBoobleMySqContext dbm = new OggleBoobleMySqContext())
                    {
                        dbm.MySqlPageHits.Add(new MySqlPageHit()
                        {
                            VisitorId = pageHitModel.VisitorId,
                            PageId = pageHitModel.PageId,
                            PageName = pageName,
                            HitDateTime = DateTime.Now
                        });
                        dbm.SaveChanges();
                        pageHitSuccessModel.PageHits = dbm.MySqlPageHits.Where(h => h.PageName == pageName).Count();
                        pageHitSuccessModel.UserHits = dbm.MySqlPageHits.Where(h => h.VisitorId == pageHitModel.VisitorId).Count();
                    }
                    //{
                    //    PageHit hit = new PageHit();
                    //    hit.VisitorId = pageHitModel.VisitorId;
                    //    hit.HitDateTime = DateTime.Now;
                    //    hit.PageId = pageHitModel.PageId;
                    //    hit.AppName = pageHitModel.AppName;
                    //    hit.PageName = pageName;
                    //    db.PageHits.Add(hit);
                    //    db.SaveChanges();
                    //}
                }
                pageHitSuccessModel.Success = "ok";
            }
            catch (Exception ex)
            {
                pageHitSuccessModel.Success = Helpers.ErrorDetails(ex);
                using (GodaddyEmailController godaddyEmail = new GodaddyEmailController())
                {
                    godaddyEmail.SendEmail("Page Visit ERROR", pageHitSuccessModel.Success);
                }
            }
            return pageHitSuccessModel;
        }

        [HttpGet]
        public GetVisitorInfoFromIPAddressSuccessModel GetVisitorIdFromIP(string ipAddress)
        {
            GetVisitorInfoFromIPAddressSuccessModel success = new GetVisitorInfoFromIPAddressSuccessModel();
            try
            {
                using (WebStatsContext db = new WebStatsContext())
                {
                    Visitor visitor = db.Visitors.Where(v => v.IpAddress == ipAddress).FirstOrDefault();
                    success.VisitorId = visitor.VisitorId;
                    success.UserName = visitor.UserName;
                    success.Success = "ok";
                }
            }
            catch (Exception ex) {
                success.Success = Helpers.ErrorDetails(ex);
            }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class ImageHitController : ApiController
    {
        [HttpPost]
        public ImageHitSuccessModel LogImageHit(logImageHItDataModel logImageHItData)
        {
            ImageHitSuccessModel imageHitSuccess = new ImageHitSuccessModel();
            try
            {
                using (OggleBoobleMySqContext dbm = new OggleBoobleMySqContext())
                {
                    DateTime utcDateTime = DateTime.UtcNow;
                    dbm.MySqlImageHits.Add(new MySqlImageHit()
                    {
                        VisitorId = logImageHItData.VisitorId,
                        PageId = logImageHItData.PageId,
                        ImageLinkId = logImageHItData.LinkId,
                        HitDateTime = utcDateTime
                    });
                    dbm.SaveChanges();
                    imageHitSuccess.HitDateTime = utcDateTime;
                    imageHitSuccess.UserHits = dbm.MySqlImageHits.Where(h => h.VisitorId == logImageHItData.VisitorId).Count();
                    imageHitSuccess.ImageHits = dbm.MySqlImageHits.Where(h => h.ImageLinkId == logImageHItData.LinkId).Count();
                    //imageHitSuccess.IpAddress = db.Visitors.Where(v => v.VisitorId == logImageHItData.VisitorId).FirstOrDefault().IpAddress;

                }
                //    using (OggleBoobleContext odc = new OggleBoobleContext())
                //    {
                //        imageHitSuccess.PageName = odc.CategoryFolders.Where(f => f.Id == logImageHItData.PageId).FirstOrDefault().FolderName;
                //    }

                //using (WebStatsContext db = new WebStatsContext())
                //{
                //    if (logImageHItData.VisitorId != "9bd90468-e633-4ee2-af2a-8bbb8dd47ad1")
                //    {
                //        db.SlideshowImages.Add(new SlideshowImage()
                //        {
                //            PkId = Guid.NewGuid().ToString(),
                //            HitDateTime = DateTime.Now,
                //            VisitorId = logImageHItData.VisitorId,
                //            PageId = logImageHItData.PageId,
                //            ImageLinkId = logImageHItData.LinkId,
                //            IsInitialHit = logImageHItData.IsInitialHit
                //        });
                //        db.SaveChanges();
                //    }
                //    imageHitSuccess.UserHits = db.SlideshowImages.Where(h => h.VisitorId == logImageHItData.VisitorId).Count();
                //    imageHitSuccess.ImageHits = db.SlideshowImages.Where(h => h.ImageLinkId == logImageHItData.LinkId).Count();
                //    imageHitSuccess.IpAddress = db.Visitors.Where(v => v.VisitorId == logImageHItData.VisitorId).FirstOrDefault().IpAddress;
                //    using (OggleBoobleContext odc = new OggleBoobleContext())
                //    {
                //        imageHitSuccess.PageName = odc.CategoryFolders.Where(f => f.Id == logImageHItData.PageId).FirstOrDefault().FolderName;
                //    }
                //}
                imageHitSuccess.Success = "ok";
            }
            catch (DbEntityValidationException dbEx) { imageHitSuccess.Success = Helpers.ErrorDetails(dbEx); }
            catch (Exception ex) { 
                imageHitSuccess.Success = Helpers.ErrorDetails(ex); 
            }
            return imageHitSuccess;
        }
    }

    [EnableCors("*", "*", "*")]
    public class HitCounterController : ApiController
    {
        [HttpGet]
        public HitCountModel GetHitCount(int pageId)
        {
            HitCountModel hit = new HitCountModel();
            try
            {
                using (WebStatsContext db = new WebStatsContext())
                {
                    hit.PageHits = db.PageHits.Where(h => h.PageName == "x").Count();
                    //Hit hit = db.Hits.Where(h => h.HitId == hitId).First();
                    //hit.ViewDuration = (DateTime.Now - hit.BeginView).TotalSeconds.ToString();
                    hit.Success = "ok";
                }
            }
            catch (Exception ex) { hit.Success = Helpers.ErrorDetails(ex); }
            return hit;
        }

        [HttpPost]
        public VisitorSuccessModel LogVisitor(VisitorModel visitorModel)
        {
            VisitorSuccessModel visitorSuccess = new VisitorSuccessModel();
            try
            {
                using (WebStatsContext db = new WebStatsContext())
                {
                    Visitor dbExisting = db.Visitors.Where(v => v.IpAddress == visitorModel.IpAddress && v.AppName == visitorModel.AppName).FirstOrDefault();
                    if (dbExisting == null)
                    {
                        // WE HAVE A NEW VISITOR
                        Visitor dbVisitor = new Visitor();
                        dbVisitor.VisitorId = Guid.NewGuid().ToString();
                        dbVisitor.UserName = visitorModel.UserName;
                        dbVisitor.AppName = visitorModel.AppName;
                        dbVisitor.IpAddress = visitorModel.IpAddress;
                        dbVisitor.City = visitorModel.City;
                        dbVisitor.Region = visitorModel.Region;
                        dbVisitor.Country = visitorModel.Country;
                        dbVisitor.GeoCode = visitorModel.GeoCode;
                        dbVisitor.InitialVisit = DateTime.Now;

                        db.Visitors.Add(dbVisitor);
                        db.SaveChanges();
                        visitorSuccess.WelcomeMessage = "Welcome new visitor!";
                        visitorSuccess.IsNewVisitor = true;
                        visitorSuccess.VisitorId = dbVisitor.VisitorId;
                        //visitorSuccess.VisitorId = dbVisitor.VisitorId;
                        //if (visitorModel.Verbosity > 2)
                        //{
                        //    using (GodaddyEmailController godaddyEmail = new GodaddyEmailController())
                        //    {
                        //        godaddyEmail.SendEmail("CONGRATULATIONS: someone new just visited your site",
                        //         "viewed " + pageName + " from " + visitorModel.City + "," + visitorModel.Region + " " + visitorModel.Country + "   ip:" + visitorModel.IpAddress);
                        //    }
                        //}
                    }
                    else
                    {
                        visitorSuccess.IsNewVisitor = false;
                        visitorSuccess.VisitorId = dbExisting.VisitorId;
                    }

                    db.Visits.Add(new Visit() { VisitorId = visitorSuccess.VisitorId, VisitDate = DateTime.Now });
                    db.SaveChanges();

                    string pageName = "";
                    using (OggleBoobleContext odb = new OggleBoobleContext())
                    {
                        pageName = odb.CategoryFolders.Where(f => f.Id == visitorModel.PageId).First().FolderName;
                        visitorSuccess.PageName = pageName;
                    }

                    if (visitorSuccess.VisitorId != "ec6fb880-ddc2-4375-8237-021732907510")
                    {
                        PageHit hit = new PageHit();
                        hit.VisitorId = visitorSuccess.VisitorId;
                        hit.HitDateTime = DateTime.Now;
                        hit.AppName = visitorModel.AppName;
                        hit.PageId = visitorModel.PageId;
                        hit.PageName = pageName;
                        db.PageHits.Add(hit);
                        db.SaveChanges();
                    }
                }
                visitorSuccess.Success = "ok";
            }
            catch (Exception ex) {
                visitorSuccess.Success = Helpers.ErrorDetails(ex);
            }
            return visitorSuccess;
        }

        [HttpPost]
        public PageHitSuccessModel LogSpecialPageHit(int pageId, string visitorId)
        {
            PageHitSuccessModel pageHitSuccess = new PageHitSuccessModel();
            if (visitorId == "9bd90468-e633-4ee2-af2a-8bbb8dd47ad1")
                pageHitSuccess.Success = "ok";
            else
            {
                try
                {
                    using (WebStatsContext db = new WebStatsContext())
                    {
                        PageHit hit = new PageHit();
                        hit.VisitorId = visitorId;
                        hit.HitDateTime = DateTime.Now;
                        //hit.AppName = pageHitModel.AppName;
                        hit.PageId = pageId;
                        //hit.PageName = pageName;
                        db.PageHits.Add(hit);
                        db.SaveChanges();

                        //if (AppDomain.CurrentDomain.BaseDirectory != "F:\\Devl\\WebApi\\")
                        //{
                        //    Visitor visitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();

                        //    using (GodaddyEmailController godaddyEmail = new GodaddyEmailController())
                        //    {
                        //        godaddyEmail.SendEmail("ALRIGHT!. Somebody Visited " + pageName, visitor.IpAddress +
                        //            " from " + visitor.City + "," + visitor.Region + " " + visitor.Country + " visited: " + pageName);
                        //    }
                        //}

                        pageHitSuccess.Success = "ok";
                    }
                }
                catch (Exception ex) { pageHitSuccess.Success = Helpers.ErrorDetails(ex); }
            }
            return pageHitSuccess;
        }

        [HttpPatch]
        public string EndVisit(string visitorId)
        {
            var success = "on no";
            try
            {
                using (WebStatsContext db = new WebStatsContext())
                {
                    Visit visit = db.Visits.Where(v => v.VisitorId == visitorId).First();

                    //hit.ViewDuration = (DateTime.Now - hit.BeginView).TotalSeconds.ToString();
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = ex.Message;
            }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class ChangeLogController : ApiController
    {
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

    [EnableCors("*", "*", "*")]
    public class EventLogController : ApiController
    {
        [HttpPost]
        public LogEventActivitySuccessModel LogEventActivity(LogEventModel logEventModel)
        {
            LogEventActivitySuccessModel logEventActivitySuccess = new LogEventActivitySuccessModel();
            try
            {
                using (WebStatsContext db = new WebStatsContext())
                {
                    db.EventLogs.Add(new EventLog()
                    {
                        EventCode = logEventModel.EvenCode,
                        PageId = logEventModel.PageId,
                        VisitorId = logEventModel.VisitorId,
                        Occured = DateTime.Now
                    });
                    db.SaveChanges();

                    logEventActivitySuccess.EventName = db.Refs.Where(r => r.RefCode == logEventModel.EvenCode).FirstOrDefault().RefDescription;
                    using (OggleBoobleContext odb = new OggleBoobleContext())
                    {
                        logEventActivitySuccess.PageName = odb.CategoryFolders.Where(f => f.Id == logEventModel.PageId).FirstOrDefault().FolderName;
                    }
                    Visitor visitor = db.Visitors.Where(v => v.VisitorId == logEventModel.VisitorId).FirstOrDefault();
                    if (visitor != null)
                    {
                        logEventActivitySuccess.IpAddress = visitor.IpAddress;
                        logEventActivitySuccess.VisitorDetails = visitor.City + ", " + visitor.Region + " " + visitor.Country;
                    }
                }
                logEventActivitySuccess.Success = "ok";
            }
            catch (Exception ex) { logEventActivitySuccess.Success = Helpers.ErrorDetails(ex); }
            return logEventActivitySuccess;
        }
    }

    [EnableCors("*", "*", "*")]
    public class HitMetricsController : ApiController
    {
        [HttpGet]
        public HitCountModel Report1(int pageId)
        {
            HitCountModel hit = new HitCountModel();
            try
            {
                using (WebStatsContext db = new WebStatsContext())
                {
                    hit.PageHits = db.PageHits.Where(h => h.PageName == "x").Count();
                    //Hit hit = db.Hits.Where(h => h.HitId == hitId).First();
                    //hit.ViewDuration = (DateTime.Now - hit.BeginView).TotalSeconds.ToString();
                    hit.Success = "ok";
                }
            }
            catch (Exception ex) { hit.Success = Helpers.ErrorDetails(ex); }
            return hit;
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