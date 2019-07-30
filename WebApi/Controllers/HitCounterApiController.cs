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
    public class RefController : ApiController
    {
        [HttpGet]
        public JsonResult<List<RefModel>> Get(string refType)
        {
            var refs = new List<RefModel>();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    IList<Ref> dbrefs = db.Refs.Where(r => r.RefType == refType).OrderBy(r => r.RefDescription).ToList();
                    foreach (Ref r in dbrefs)
                    {
                        refs.Add(new RefModel() { RefCode = r.RefCode, RefDescription = r.RefDescription });
                    }
                }
            }
            catch (Exception ex)
            {
                refs.Add(new RefModel() { RefCode = "ERR", RefType = "ERR", RefDescription = Helpers.ErrorDetails(ex) });
            }
            return Json(refs);
        }

        [HttpPost]
        public JsonResult<RefModel> Post(RefModel refModel)
        {
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    Ref @ref = new Ref();
                    @ref.RefType = refModel.RefType;
                    @ref.RefCode = GetUniqueRefCode(refModel.RefDescription, db);
                    @ref.RefDescription = refModel.RefDescription;

                    db.Refs.Add(@ref);
                    db.SaveChanges();
                    refModel.RefCode = @ref.RefCode;
                    refModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                refModel.Success = ex.Message;
            }
            return Json(refModel);
        }

        [HttpPut]
        public JsonResult<string> Put(RefModel refModel)
        {
            string success = "";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    Ref @ref = db.Refs.Where(r => r.RefCode == refModel.RefCode).First();
                    @ref.RefDescription = refModel.RefDescription;
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = ex.Message; }
            return Json(success);
        }

        /// helper apps
        private string GetUniqueRefCode(string refDescription, WebSiteContext db)
        {
            if (refDescription.Length < 3)
                refDescription = refDescription.PadRight(3, 'A');

            var refCode = refDescription.Substring(0, 3).ToUpper();
            Ref exists = new Ref();
            while (exists != null)
            {
                exists = db.Refs.Where(r => r.RefCode == refCode).FirstOrDefault();
                if (exists != null)
                {
                    char nextLastChar = refCode.Last();
                    if (nextLastChar == ' ') { nextLastChar = 'A'; }
                    if (nextLastChar == 'Z')
                        nextLastChar = 'A';
                    else
                        nextLastChar = (char)(((int)nextLastChar) + 1);
                    refCode = refCode.Substring(0, 2) + nextLastChar;
                }
            }
            return refCode;
        }
    }

    [EnableCors("*", "*", "*")]
    public class HitCounterController : ApiController
    {
        [HttpPost]
        public SuccessModel LogVisit(string userName, string appName)
        {
            SuccessModel success = new SuccessModel();
            try
            {
                //if ((ipAddress == "68.203.90.183") || (ipAddress == "50.62.160.105"))
                //{
                //    success.Success = "ok";
                //    return success;
                //}
                //using (AspNetContext db = new AspNetContext())
                //{
                //    AspNetUser aspNetUser = db.AspNetUsers.Where(u => u.UserName == userName).FirstOrDefault();
                //    if (aspNetUser != null)
                //    {
                //        success.ReturnValue = "Welcome back " + aspNetUser.UserName;
                //        visitorId = aspNetUser.Id;
                //    }
                //}
                string ipAddress = Helpers.GetIPAddress();
                using (WebSiteContext db = new WebSiteContext())
                {
                    Visitor dexisting = db.Visitors.Where(v => v.IPAddress == ipAddress && v.UserName == userName).FirstOrDefault();
                    if (dexisting == null)
                    {
                        //string visitorId = Guid.NewGuid().ToString();
                        Visitor existing = db.Visitors.Where(v => v.IPAddress == ipAddress).FirstOrDefault();
                        if (existing == null)
                        {
                            // WE HAVE A NEW VISITOR
                            Visitor visitor = new Visitor();
                            visitor.Id = Guid.NewGuid().ToString();
                            visitor.UserName = userName;
                            visitor.AppName = appName;
                            visitor.IPAddress = ipAddress;
                            visitor.CreateDate = DateTime.Now;

                            db.Visitors.Add(visitor);
                            db.SaveChanges();
                            success.ReturnValue = "Welcome new visitor!";
                            new GodaddyEmailController().SendEmail("CONGRATULATIONS: someone new just visited your site", "ip: " + ipAddress + " visited: " + appName);
                        }
                        else
                        {
                            if (userName == "unknown")
                                success.ReturnValue = "Welcome back from " + ipAddress;
                            else
                                success.ReturnValue = "Welcome back " + userName;

                            bool logVisit = true;
                            Visit lastVisit = db.Visits.Where(v => v.IPAddress == ipAddress && v.UserName == userName).OrderByDescending(v => v.VisitDate).FirstOrDefault();
                            if (lastVisit != null)
                            {
                                if ((DateTime.Now - lastVisit.VisitDate).TotalHours < 5)
                                {
                                    logVisit = false;
                                    success.ReturnValue = "";
                                }
                            }
                            if (logVisit)
                            {
                                Visit visit = new Visit();
                                visit.VisitorId = Guid.NewGuid().ToString();
                                visit.UserName = userName;
                                visit.IPAddress = ipAddress;
                                visit.AppName = appName;
                                visit.VisitDate = DateTime.Now;

                                db.Visits.Add(visit);
                                db.SaveChanges();

                                success.ReturnValue = "Welcome back " + ipAddress;

                                if ((ipAddress == "68.203.90.183") || (ipAddress == "50.62.160.105"))
                                {
                                    success.ReturnValue = "dev [" + userName + "]";
                                }
                                else
                                {
                                    new GodaddyEmailController().SendEmail("Site Visit", "ip: " + ipAddress + " visited: " + appName);

                                    if (userName == "unknown")
                                        success.ReturnValue = "Welcome back from " + ipAddress;
                                    else
                                        success.ReturnValue = "Welcome back. Please log in";
                                }
                            }
                        }
                    }
                }
                success.Success = "ok";
            }
            catch (Exception ex) { success.Success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        public SuccessModel LogPageHit(HitCounterModel hitCounterModel)
        {
            SuccessModel successModel = new SuccessModel();
            try
            {
                string ipAddress = Helpers.GetIPAddress();
                if ((ipAddress != "68.203.90.183") && (ipAddress != "50.62.160.105")) {
                    using (LoginContext db = new LoginContext())
                    {
                        PageHit hit = new PageHit();
                        hit.PkId = Guid.NewGuid().ToString();
                        hit.IpAddress = ipAddress;
                        hit.AppId = hitCounterModel.AppId;
                        hit.HitDateTime = DateTime.Now;
                        hit.PageName = hitCounterModel.PageName;
                        hit.UserName = hitCounterModel.UserName;
                        db.PageHits.Add(hit);
                        db.SaveChanges();

                        new GodaddyEmailController().SendEmail("Site Visit", hitCounterModel.UserName + " from ip: " + ipAddress + " visited: " + hitCounterModel.PageName);
                    }
                }
                successModel.ReturnValue = ipAddress;
                successModel.Success = "ok";
            }
            catch (Exception ex) { successModel.Success = Helpers.ErrorDetails(ex); }
            return successModel;
        }

        [HttpPost]
        public SuccessModel RecordLogin(string userName)
        {
            SuccessModel success = new SuccessModel();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    //Hit hit = db.Hits.Where(h => h.HitId == hitId).First();


                    //hit.ViewDuration = (DateTime.Now - hit.BeginView).TotalSeconds.ToString();
                    db.SaveChanges();
                    success.Success = "ok";
                }
            }
            catch (Exception ex) { success.Success = Helpers.ErrorDetails(ex); }
            return success;
        }



        [HttpPatch]
        public string EndVisit(int hitId)
        {
            var success = "on no";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    Hit hit = db.Hits.Where(h => h.HitId == hitId).First();
                    hit.ViewDuration = (DateTime.Now - hit.BeginView).TotalSeconds.ToString();
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
    public class HitCounterModel
    {
        public string UserName { get; set; }
        public string PageName { get; set; }
        public string AppId { get; set; }
    }

}
