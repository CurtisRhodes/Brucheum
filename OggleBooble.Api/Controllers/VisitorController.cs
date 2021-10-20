using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using OggleBooble.Api.MySqlDataContext;
using OggleBooble.Api.Models;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class VisitorController : ApiController
    {
        [HttpPost]
        [Route("api/Visitor/AddVisitor")]
        public string AddVisitor(AddVisitorModel visitorData)
        {
            string success = "ono";
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var newVisitor = new Visitor()
                    {
                        VisitorId = visitorData.VisitorId,
                        IpAddress = visitorData.IpAddress,
                        City = visitorData.City,
                        Country = visitorData.Country,
                        GeoCode = visitorData.GeoCode,
                        Region = visitorData.Region,
                        InitialPage = visitorData.InitialPage,
                        InitialVisit = DateTime.Now
                    };
                    db.Visitors.Add(newVisitor);
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpPut]
        [Route("api/Visitor/UpdateVisitor")]
        public VerifyVisitorSuccessModel UpdateVisitor(AddVisitorModel visitorData) {
            var updateVisitorSuccessModel = new VerifyVisitorSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    Visitor visitor1 = db.Visitors.Where(v => v.VisitorId == visitorData.VisitorId).FirstOrDefault();
                    if (visitor1 == null)
                    {
                        updateVisitorSuccessModel.ReturnValue = "VisitorId not found";
                    }
                    else
                    {
                        Visitor visitor2 = db.Visitors.Where(v => v.IpAddress == visitorData.IpAddress).FirstOrDefault();
                        if (visitor2 == null)
                        {
                            visitor1.City = visitorData.City;
                            visitor1.IpAddress = visitorData.IpAddress;
                            visitor1.Country = visitorData.Country;
                            visitor1.GeoCode = visitorData.GeoCode;
                            visitor1.Region = visitorData.Region;
                            if (visitor1.InitialPage == 0)
                                visitor1.InitialPage = visitorData.InitialPage;
                            db.SaveChanges();
                            updateVisitorSuccessModel.ReturnValue = "New Ip Visitor Updated";
                        }
                        else
                        {
                            if (visitor2.Country == "ZZ")
                            {
                                updateVisitorSuccessModel.ReturnValue = "bad duplicate Ip";
                            }
                            else {
                                if (visitor2.InitialPage == 0)
                                    visitor2.InitialPage = visitor1.InitialPage;
                                db.Visitors.Remove(visitor1);
                                db.SaveChanges();
                                updateVisitorSuccessModel.ComprableIpAddressVisitorId = visitor2.VisitorId;
                                updateVisitorSuccessModel.ReturnValue = "Duplicate Ip";
                            }
                        }
                    }
                }
                updateVisitorSuccessModel.Success = "ok";
            }
            catch (Exception ex)
            {
                updateVisitorSuccessModel.Success = Helpers.ErrorDetails(ex);
            }
            return updateVisitorSuccessModel;
        }

        [HttpGet]
        [Route("api/Visitor/ScreenIplookupCandidate")]
        public LookupCandidateModel ScreenIplookupCandidate(string visitorId) {
            var lookupCandidateModel = new LookupCandidateModel();
            try
            {
                lookupCandidateModel.lookupStatus = "passed";
                using (var db = new OggleBoobleMySqlContext())
                {
                    Visitor dbVisitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                    if (dbVisitor == null)
                    {
                        lookupCandidateModel.lookupStatus = "visitorId not found";
                    }
                    if (dbVisitor.Country != "ZZ")
                    {
                        lookupCandidateModel.lookupStatus = "country not ZZ";
                    }
                    if (dbVisitor.VisitorId.Length != 36)
                    {
                        lookupCandidateModel.lookupStatus = "bad visitor Id";
                    }
                    if (dbVisitor.GeoCode == "too many page hits")
                    {
                        lookupCandidateModel.lookupStatus = "too many page hits";
                    }
                    if (dbVisitor.GeoCode == "too many page hits")
                    {
                        lookupCandidateModel.lookupStatus = "too many page hits";
                    }
                    if (lookupCandidateModel.lookupStatus == "passed")
                    {
                        if (dbVisitor.InitialVisit < DateTime.Today.AddMonths(-1))
                        {
                            lookupCandidateModel.lookupStatus = "pending months old InitialVisit";
                            dbVisitor.GeoCode = "months old InitialVisit";
                            db.SaveChanges();
                        }
                    }
                    if (dbVisitor.GeoCode == "too many page hits")
                    {
                        lookupCandidateModel.lookupStatus = "too many page hits";
                    }
                    if (lookupCandidateModel.lookupStatus == "passed")
                    {
                        int pageHits = db.PageHits.Where(h => h.VisitorId == visitorId).Count();
                        if (pageHits > 10)
                        {
                            lookupCandidateModel.lookupStatus = "pending too many pageHits";
                            dbVisitor.GeoCode = "too many page hits";
                            db.SaveChanges();
                        }
                    }
                    if (lookupCandidateModel.lookupStatus == "passed")
                    {
                        var dupeCheck1 = db.ActivityLogs.Where(a => a.ActivityCode == "IP1" && a.VisitorId == visitorId && a.Occured > DateTime.Today).FirstOrDefault();
                        if (dupeCheck1 != null)
                        {
                            lookupCandidateModel.lookupStatus = "already looked up today";
                        }
                    }
                }
                lookupCandidateModel.Success = "ok";
            }
            catch (Exception ex)
            {
                lookupCandidateModel.Success = Helpers.ErrorDetails(ex);
            }
            return lookupCandidateModel;
        }

        [HttpGet]
        [Route("api/Visitor/GetVisitorInfo")]
        public VisitorInfoSuccessModel GetVisitorInfo(string visitorId)
        {
            var visitorInfoModel = new VisitorInfoSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    Visitor dbVisitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                    if (dbVisitor == null)
                        visitorInfoModel.Success = "not found";
                    else
                    {
                        RegisteredUser dbRegisteredUser = db.RegisteredUsers.Where(u => u.VisitorId == visitorId).FirstOrDefault();
                        if (dbRegisteredUser == null)
                        {
                            visitorInfoModel.IsRegisteredUser = false;
                        }
                        else
                        {
                            visitorInfoModel.IsRegisteredUser = true;
                            visitorInfoModel.RegisteredUser = dbRegisteredUser;
                        }
                        visitorInfoModel.Country = dbVisitor.Country;
                        visitorInfoModel.City = dbVisitor.City;
                        visitorInfoModel.GeoCode = dbVisitor.GeoCode;
                        visitorInfoModel.IpAddress = dbVisitor.IpAddress;
                        visitorInfoModel.Success = "ok";
                    }
                }
            }
            catch (Exception ex)
            {
                visitorInfoModel.Success = Helpers.ErrorDetails(ex);
            }
            return visitorInfoModel;
        }

        [HttpGet]
        [Route("api/Visitor/VerifyVisitor")]
        public VerifyVisitorSuccessModel VerifyVisitor(string visitorId)
        {
            var successModel = new VerifyVisitorSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    Visitor dbVisitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                    if (dbVisitor != null)
                    {
                        successModel.ReturnValue = "visitorId ok";
                        //if (dbVisitor.Country == "ZZ") successModel.ReturnValue = "unknown country";
                    }
                    else { 
                        RetiredVisitor dbRetiredVisitor = db.RetiredVisitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                        if (dbRetiredVisitor != null)
                        {
                            var dbComprableIpAddressVisitor = db.Visitors.Where(v => v.IpAddress == dbRetiredVisitor.IpAddress).FirstOrDefault();
                            if (dbComprableIpAddressVisitor != null)
                            {
                                successModel.ComprableIpAddressVisitorId = dbComprableIpAddressVisitor.VisitorId;
                                successModel.ReturnValue = "retired visitor";
                            }
                            else {
                                successModel.ReturnValue = "retired visitor comparable not found";
                            }
                        }
                        else
                            successModel.ReturnValue = "not found";
                    }
                }
                successModel.Success = "ok";
            }
            catch (Exception ex) { successModel.Success = Helpers.ErrorDetails(ex); }
            return successModel;
        }

        [HttpGet]
        [Route("api/Visitor/GetVisitorFromIp")]
        public SuccessModel GetVisitorFromIp(string ipAddress)
        {
            var successModel = new SuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    Visitor dbVisitor = db.Visitors.Where(v => v.IpAddress == ipAddress).FirstOrDefault();
                    if (dbVisitor == null)
                    {
                        successModel.ReturnValue = "not found";
                        successModel.Success = "ok";
                    }
                    else
                    {
                        successModel.ReturnValue = dbVisitor.VisitorId;
                        successModel.Success = "ok";
                    }
                }
            }
            catch (Exception ex)
            {
                successModel.Success = Helpers.ErrorDetails(ex);
            }
            return successModel;
        }
        
        [HttpPut]
        [Route("api/Visitor/TagVisitor")]
        public string TagVisitor(string visitorId, string tagValue) {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    Visitor dbVisitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                    if (dbVisitor == null)
                        success = "VisitorId not found";
                    else
                    {
                        dbVisitor.City = "already processed";
                        dbVisitor.GeoCode = tagValue;
                        db.SaveChanges();
                        success = "ok";
                    }
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class VisitController : ApiController
    {
        [HttpPost]
        [Route("api/Common/LogVisit")]
        public SuccessModel LogVisit(string visitorId)
        {
            //LogVisitSuccessModel visitSuccessModel = new LogVisitSuccessModel() { VisitAdded = false, IsNewVisitor = false };
            SuccessModel successModel = new SuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbVisitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                    if (dbVisitor == null)
                    {
                        successModel.ReturnValue = "VisitorId not found";
                    }
                    else
                    {
                        //  { VisitAdded = false, IsNewVisitor = false }
                        DateTime lastVisitDate = DateTime.MinValue;
                        List<Visit> visitorVisits = db.Visits.Where(v => v.VisitorId == visitorId).ToList();
                        if (visitorVisits.Count() > 0)
                        {
                            lastVisitDate = visitorVisits.OrderByDescending(v => v.VisitDate).FirstOrDefault().VisitDate;
                        }
                        if ((lastVisitDate == DateTime.MinValue) || ((DateTime.Now - lastVisitDate).TotalHours > 12))
                        {
                            db.Visits.Add(new Visit()
                            {
                                VisitorId = visitorId,
                                VisitDate = DateTime.Now
                            });
                            db.SaveChanges();
                            if (visitorVisits.Count() == 0)
                                successModel.ReturnValue = "new visitor logged";
                            else
                                successModel.ReturnValue = "return visit logged";
                        }
                        else
                            successModel.ReturnValue = "no visit recorded";
                    }
                    successModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                successModel.Success = Helpers.ErrorDetails(ex);
            }
            return successModel;
        }
    }
}


