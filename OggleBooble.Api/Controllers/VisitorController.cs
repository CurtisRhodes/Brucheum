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
        public SuccessModel UpdateVisitor(AddVisitorModel visitorData) {
            var updateVisitorSuccessModel = new SuccessModel();
            try
            {
                if (visitorData.City == "ZZ")
                {
                    updateVisitorSuccessModel.Success = "IpInfo ZZ fail";
                    return updateVisitorSuccessModel;
                }
                using (var db = new OggleBoobleMySqlContext())
                {
                    Visitor visitor1 = db.Visitors.Where(v => v.VisitorId == visitorData.VisitorId).FirstOrDefault();
                    if (visitor1 == null)
                    {
                        updateVisitorSuccessModel.Success = "VisitorId not found";
                        return updateVisitorSuccessModel;
                    }
                    visitor1.City = visitorData.City;
                    visitor1.IpAddress = visitorData.IpAddress;
                    visitor1.Country = visitorData.Country;
                    visitor1.GeoCode = visitorData.GeoCode;
                    visitor1.Region = visitorData.Region;
                    if (visitor1.InitialPage == 0)
                        visitor1.InitialPage = visitorData.InitialPage;
                    db.SaveChanges();

                    List<Visitor> duplicateIpVisitors = db.Visitors
                         .Where(v => (v.IpAddress == visitorData.IpAddress) && (v.VisitorId != visitorData.VisitorId)).ToList();

                    if (duplicateIpVisitors.Count == 0)
                    {
                        updateVisitorSuccessModel.ReturnValue = "New Ip Visitor Updated";
                    }
                    else
                    {
                        updateVisitorSuccessModel.ReturnValue = "Duplicate Ip";
                        /////////////////  DUPLICATE IP
                        string firstVisitorId = visitor1.VisitorId;
                        int imageHitsChanged, pageHitsChanged, activityLogsChanged;
                        foreach (Visitor sameIpVisitor in duplicateIpVisitors)
                        {
                            if (sameIpVisitor.VisitorId != visitor1.VisitorId)
                            {
                                if (visitor1.City != sameIpVisitor.City)
                                {
                                    if (sameIpVisitor.City == "ZZ" && visitor1.City != "ZZ")
                                    {
                                        //updateVisitorSuccessModel.Message2 = "ZZ Visitor Updated";
                                    }
                                    else
                                    { 
                                    
                                    }
                                }
                                //updateVisitorSuccessModel.SameIp = visitor2.VisitorId;
                                //visitor1.IpAddress = visitorData.IpAddress;
                                //updateVisitorSuccessModel.Message1 = "New Ip Visitor Updated";
                                //updateVisitorSuccessModel.Message1 = "Existing IP";
                                //updateVisitorSuccessModel.Message2 = "Existing Ip found. ZZ removed";
                                //updateVisitorSuccessModel.Message2 = "Existing Ip Cookie Problem";
                                //updateVisitorSuccessModel.Message2 += "Initial Page updated";

                                try
                                {
                                    imageHitsChanged = db.Database.ExecuteSqlCommand(
                                        "Update OggleBooble.ImageHit set VisitorId = '" + firstVisitorId + "' where VisitorId='" + sameIpVisitor.VisitorId + "';");
                                    //repairReport.ImageHitsUpdated += imageHitsChanged;
                                }
                                catch { }
                                try
                                {
                                    pageHitsChanged = db.Database.ExecuteSqlCommand(
                                        "Update OggleBooble.PageHit set VisitorId = '" + firstVisitorId + "' where VisitorId='" + sameIpVisitor.VisitorId + "';");
                                    //repairReport.PageHitsUpdated += pageHitsChanged;
                                }
                                catch { }
                                try
                                {
                                    activityLogsChanged = db.Database.ExecuteSqlCommand(
                                        "Update OggleBooble.ActivityLog set VisitorId ='" + firstVisitorId + "' where VisitorId='" + sameIpVisitor.VisitorId + "';");
                                    //repairReport.ActivityLogsUpdated += activityLogsChanged;
                                }
                                catch { }
                                try
                                {
                                    db.RetiredVisitors.Add(new RetiredVisitor()
                                    {
                                        VisitorId = sameIpVisitor.VisitorId,
                                        IpAddress = sameIpVisitor.IpAddress,
                                        City = sameIpVisitor.City,
                                        Country = sameIpVisitor.Country,
                                        GeoCode = sameIpVisitor.GeoCode,
                                        InitialPage = sameIpVisitor.InitialPage,
                                        InitialVisit = sameIpVisitor.InitialVisit,
                                        Region = sameIpVisitor.Region
                                    });
                                    db.Visitors.Remove(sameIpVisitor);
                                    db.SaveChanges();
                                    //repairReport.VisitorRowsRemoved++;
                                }
                                catch (Exception ex)
                                {
                                    updateVisitorSuccessModel.Success = Helpers.ErrorDetails(ex);
                                    return updateVisitorSuccessModel;
                                }
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
                using (var db = new OggleBoobleMySqlContext())
                {
                    Visitor dbVisitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                    lookupCandidateModel.Success = "ok";
                    if (dbVisitor == null)
                    {
                        lookupCandidateModel.lookupStatus = "visitorId not found";
                        return lookupCandidateModel;
                    }

                    var dupeCheck1 = db.ActivityLogs.Where(a => a.ActivityCode == "IP1" && a.VisitorId == visitorId).FirstOrDefault();
                    if (dupeCheck1 != null)
                    {
                        lookupCandidateModel.lookupStatus = "already looked up";
                        return lookupCandidateModel;
                    }

                    if (dbVisitor.Country != "ZZ")
                    {
                        lookupCandidateModel.lookupStatus = "country not ZZ";
                        return lookupCandidateModel;
                    }
                    if (dbVisitor.City == "fail two")
                    {
                        lookupCandidateModel.lookupStatus = "fail two";
                        return lookupCandidateModel;
                    }
                    if (dbVisitor.City == "already processed")
                    {
                        lookupCandidateModel.lookupStatus = "already processed";
                        dbVisitor.City = "fail two";
                        db.SaveChanges();
                        return lookupCandidateModel;
                    }
                    if (dbVisitor.VisitorId.Length != 36)
                    {
                        lookupCandidateModel.lookupStatus = "bad visitor Id";
                        return lookupCandidateModel;
                    }

                    string alreadyBurnedVisitor =
                        (from a in db.ActivityLogs
                         where a.Occured > DateTime.Today
                         && a.ActivityCode == "ip7" && a.VisitorId == visitorId
                         select a.VisitorId).FirstOrDefault();
                    if (alreadyBurnedVisitor != null)
                        lookupCandidateModel.lookupStatus = "alreadyBurnedVisitor";
                    else
                        lookupCandidateModel.lookupStatus = "passed";
                }
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
                    if (dbVisitor == null) {
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
                    else
                    {
                        successModel.ReturnValue = "visitorId ok";
                        if (dbVisitor.Country == "ZZ")
                            successModel.ReturnValue = "unknown country";
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

        [HttpGet]
        [Route("api/Visitor/DoubleCheckVisitorId")]
        public SuccessModel DoubleCheckVisitorId(string visitorId)
        {
            SuccessModel successModel = new SuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbVisitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                    if (dbVisitor == null)
                    {
                        Visitor unkVisitor = new Visitor()
                        {
                            VisitorId = visitorId,
                            IpAddress = "00.00.00",
                            City = "readded",
                            Country = "ZZ",
                            Region = "readded",
                            GeoCode = "readded",
                            //InitialPage: folderId
                        };
                        db.SaveChanges();
                        successModel.ReturnValue = "readded";
                    }
                    else
                    {
                        if (dbVisitor.Region == "readded")
                        {
                            successModel.ReturnValue = "repeatOffender";
                            db.SaveChanges();
                        }
                        else
                        {
                            dbVisitor.Region = "repeatOffender";
                            db.SaveChanges();
                            successModel.ReturnValue = "inalready";
                        }
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


