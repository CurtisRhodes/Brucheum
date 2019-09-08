using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Net.Mail;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Results;
using WebApi.Models;
using WebApi.DataContext;
using WebApi.AspNet.DataContext;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class HitCounterController : ApiController
    {
        [HttpGet]
        public LogVisitModel Get()
        {
            LogVisitModel visitModel = new LogVisitModel();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    //Hit hit = db.Hits.Where(h => h.HitId == hitId).First();
                    //hit.ViewDuration = (DateTime.Now - hit.BeginView).TotalSeconds.ToString();
                    visitModel.Success = "ok";
                }
            }
            catch (Exception ex) { visitModel.Success = Helpers.ErrorDetails(ex); }
            return visitModel;
        }

        [HttpPost]
        public LogVisitModel LogVisit(VisitorModel visitorModel)
        {
            LogVisitModel visitSuccessModel = new LogVisitModel();
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
                        dbVisitor.UserName = visitorModel.CookieName;
                        dbVisitor.AppName = visitorModel.AppName;
                        dbVisitor.IpAddress = visitorModel.IpAddress;
                        dbVisitor.City = visitorModel.City;
                        dbVisitor.Region = visitorModel.Region;
                        dbVisitor.Country = visitorModel.Country;
                        dbVisitor.GeoCode = visitorModel.GeoCode;

                        db.Visitors.Add(dbVisitor);
                        db.SaveChanges();
                        visitSuccessModel.WelcomeMessage = "Welcome new visitor!";
                        visitSuccessModel.VisitorId = dbVisitor.VisitorId;
                        using (GodaddyEmailController godaddyEmail = new GodaddyEmailController())
                        {
                            //godaddyEmail.SendEmail("CONGRATULATIONS: someone new just visited your site", "ip: " + visitorModel.IpAddress + " visited: " + visitorModel.AppName);
                            // translate

                            godaddyEmail.SendEmail("CONGRATULATIONS: someone new just visited your site",
                             visitorModel.IpAddress + " from " + visitorModel.City + "," + visitorModel.Country + " " + visitorModel.Region
                                + ".  Initial visit: " + visitorModel.PageName);
                        }
                    }
                    else
                    {
                        visitSuccessModel.VisitorId = dbExisting.VisitorId;
                        if (visitorModel.CookieName == "unknown")
                            visitSuccessModel.WelcomeMessage = "Welcome back from " + dbExisting.IpAddress + " please log in";
                        else
                        {
                            if (dbExisting.UserName != visitorModel.CookieName)
                            {
                                dbExisting.UserName = visitorModel.CookieName;
                                db.SaveChanges();
                            }
                            visitSuccessModel.WelcomeMessage = "Welcome back " + dbExisting.UserName;
                        }
                        bool logVisit = true;
                        Visit lastVisit = db.Visits.Where(v => v.VisitorId == visitSuccessModel.VisitorId).OrderByDescending(v => v.VisitDate).FirstOrDefault();
                        if (lastVisit != null)
                        {
                            if ((DateTime.Now - lastVisit.VisitDate).TotalHours < 12)
                            {
                                logVisit = false;
                                visitSuccessModel.WelcomeMessage = "";
                            }
                        }
                        if (logVisit)
                        {
                            Visit visit = new Visit() { VisitorId = visitSuccessModel.VisitorId, VisitDate = DateTime.Now };
                            db.Visits.Add(visit);
                            db.SaveChanges();

                            if ((visitorModel.IpAddress != "68.203.90.183") && (visitorModel.IpAddress != "50.62.160.105"))
                            {
                                using (GodaddyEmailController godaddyEmail = new GodaddyEmailController())
                                {
                                    godaddyEmail.SendEmail("VERY GOOD: someone came back for another visit",
                                     visitorModel.IpAddress + " from " + visitorModel.City + "," + visitorModel.Country + " " + visitorModel.Region
                                        + ".  Initial visit: " + visitorModel.PageName);
                                }
                            }
                        }
                    }
                }
                visitSuccessModel.Success = "ok";
            }
            catch (Exception ex) { visitSuccessModel.Success = Helpers.ErrorDetails(ex); }
            return visitSuccessModel;
        }

        [HttpPut]
        public SuccessModel LogPageHit(PageHitModel pageHitModel)
        {
            SuccessModel successModel = new SuccessModel();
            try
            {
                if ((pageHitModel.IpAddress != "68.203.90.183") && (pageHitModel.IpAddress != "50.62.160.105"))
                {
                    using (WebStatsContext db = new WebStatsContext())
                    {
                        PageHit hit = new PageHit();
                        hit.VisitorId = pageHitModel.VisitorId;
                        hit.HitDateTime = DateTime.Now;
                        hit.AppName = pageHitModel.AppName;
                        hit.PageName = pageHitModel.PageName;
                        db.PageHits.Add(hit);
                        db.SaveChanges();

                        if (pageHitModel.Verbose)
                        {
                            new GodaddyEmailController().SendEmail("Page Visit", "Visitor " + pageHitModel.IpAddress + " visited: " + pageHitModel.PageName);
                        }
                        successModel.Success = "ok";
                    }
                }
                successModel.ReturnValue = "ok";
            }
            catch (Exception ex) { successModel.Success = Helpers.ErrorDetails(ex); }
            return successModel;
        }

        //[HttpPost]
        //public SuccessModel RecordLogin()
        //{
        //    SuccessModel success = new SuccessModel();
        //    try
        //    {
        //        using (WebSiteContext db = new WebSiteContext())
        //        {
        //            //Hit hit = db.Hits.Where(h => h.HitId == hitId).First();


        //            //hit.ViewDuration = (DateTime.Now - hit.BeginView).TotalSeconds.ToString();
        //            db.SaveChanges();
        //            success.Success = "ok";
        //        }
        //    }
        //    catch (Exception ex) { success.Success = Helpers.ErrorDetails(ex); }
        //    return success;
        //}

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
                    db.ChangeLogs.Add(new ChangeLog()
                    {
                        PageId = changeLog.PageId,
                        PageName = changeLog.PageName,
                        Activity = changeLog.Activity,
                        Occured = DateTime.Now
                    });
                    db.SaveChanges();
                }
                success = "ok";
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }




}