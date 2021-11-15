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
        [Route("api/Visitor/AddUniqueIpVisitor")]

        //url: settingsArray.ApiServer + "api/Visitor/AddVisitor&ipAddress=" + ipAddress + "&initialPage=" + folderId,
        public AddVisitorSuccessModel AddUniqueIpVisitor(string ipAddress,string calledFrom)
        {
            AddVisitorSuccessModel successModel = new AddVisitorSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    Visitor existingVisitor = db.Visitors.Where(v => v.IpAddress == ipAddress).FirstOrDefault();
                    if (existingVisitor == null)
                    {
                        successModel.VisitorId = Guid.NewGuid().ToString();
                        var newVisitor = new Visitor()
                        {
                            VisitorId = successModel.VisitorId,
                            IpAddress = ipAddress,
                            Country = "ZZ",
                            City = calledFrom,
                            GeoCode = "",
                            Region = "",
                            InitialPage = 0,
                            InitialVisit = DateTime.Now
                        };
                        db.Visitors.Add(newVisitor);
                        db.SaveChanges();
                        successModel.ErrorMessage = "ok";
                    }
                    else {
                        successModel.ErrorMessage = "existing Ip";
                        successModel.VisitorId = existingVisitor.VisitorId;
                    }
                    successModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                successModel.Success= Helpers.ErrorDetails(ex);
            }
            return successModel;
        }

        [HttpPut]
        [Route("api/Visitor/UpdateVisitor")]
        public UpdateVisitorSuccessModel UpdateVisitor(AddVisitorModel visitorData)
        {
            var updateVisitorSuccessModel = new UpdateVisitorSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    Visitor dbVisitor = db.Visitors.Where(v => v.VisitorId == visitorData.VisitorId).FirstOrDefault();
                    if (dbVisitor == null)
                        updateVisitorSuccessModel.VisitorIdExists = false;
                    else
                    {
                        updateVisitorSuccessModel.VisitorIdExists = true;
                        dbVisitor.City = visitorData.City;
                        dbVisitor.IpAddress = visitorData.IpAddress;
                        dbVisitor.Country = visitorData.Country;
                        dbVisitor.GeoCode = visitorData.GeoCode;
                        dbVisitor.Region = visitorData.Region;
                        if (dbVisitor.InitialPage == 0)
                            dbVisitor.InitialPage = visitorData.InitialPage;
                        db.SaveChanges();
                    }
                    updateVisitorSuccessModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                updateVisitorSuccessModel.Success = Helpers.ErrorDetails(ex);
            }
            return updateVisitorSuccessModel;
        }

        [HttpPut]
        [Route("api/Visitor/UpdateIfyVisitor")]
        public string UpdateIfyVisitor(string visitorId, string ipAddress)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    Visitor visitor1 = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                    if (visitor1 == null)
                        success = "VisitorId not exits";
                    else
                    {
                        visitor1.IpAddress = ipAddress;
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

        [HttpGet]
        [Route("api/Visitor/ScreenIplookupCandidate")]
        public LookupCandidateModel ScreenIplookupCandidate(string visitorId)
        {
            var lookupCandidateModel = new LookupCandidateModel();
            try
            {
                lookupCandidateModel.LookupStatus = "ok";
                using (var db = new OggleBoobleMySqlContext())
                {
                    Visitor dbVisitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                    if (dbVisitor == null)
                        lookupCandidateModel.LookupStatus = "visitorId not found";
                    else
                    { 
                        if (dbVisitor.Country != "ZZ")
                            lookupCandidateModel.LookupStatus = "country not ZZ";
                        else if (dbVisitor.VisitorId.Length != 36)
                            lookupCandidateModel.LookupStatus = "bad visitor Id";
                    }
                    if (lookupCandidateModel.LookupStatus == "ok")
                    {
                        Visitor dbExistingIpVisitor = db.Visitors.Where(v => v.IpAddress == dbVisitor.IpAddress).FirstOrDefault();
                        if (dbExistingIpVisitor != null)
                        {
                            lookupCandidateModel.LookupStatus = "existing Ip";
                            lookupCandidateModel.ExistingIpAddressVisitorId = dbExistingIpVisitor.VisitorId;

                            db.Visitors.Remove(dbVisitor);
                            db.SaveChanges();
                        }
                        else
                        {
                            lookupCandidateModel.DupeHits = db.ActivityLogs.Where(a => a.ActivityCode == "I00" && a.VisitorId == visitorId && a.Occured > DateTime.Today).Count();
                            lookupCandidateModel.IpAddress = dbVisitor.IpAddress; ;
                        }
                    }
                    lookupCandidateModel.Success = "ok";
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
                        visitorInfoModel.VisitorFound = false;
                    else
                    {
                        visitorInfoModel.VisitorFound = true;
                        RegisteredUser dbRegisteredUser = db.RegisteredUsers.Where(u => u.VisitorId == visitorId).FirstOrDefault();
                        if (dbRegisteredUser == null)
                            visitorInfoModel.IsRegisteredUser = false;
                        else
                        {
                            visitorInfoModel.IsRegisteredUser = true;
                            visitorInfoModel.RegisteredUser = dbRegisteredUser;
                        }
                        visitorInfoModel.Country = dbVisitor.Country;
                        visitorInfoModel.City = dbVisitor.City;
                        visitorInfoModel.GeoCode = dbVisitor.GeoCode;
                        visitorInfoModel.IpAddress = dbVisitor.IpAddress;
                    }
                    visitorInfoModel.Success = "ok";
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
            var verifyVisitorSuccess = new VerifyVisitorSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    Visitor dbVisitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                    if (dbVisitor == null)
                        verifyVisitorSuccess.VisitorIdExists = false;
                    else {
                        verifyVisitorSuccess.VisitorIdExists = true;
                        verifyVisitorSuccess.Country = dbVisitor.Country;
                        var dbRegisterUser = db.RegisteredUsers.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                        if (dbRegisterUser == null)
                            verifyVisitorSuccess.IsRegisteredUser = false;
                        else {
                            verifyVisitorSuccess.IsRegisteredUser = true;
                        }
                    }
                }
                verifyVisitorSuccess.Success = "ok";
            }
            catch (Exception ex) { verifyVisitorSuccess.Success = Helpers.ErrorDetails(ex); }
            return verifyVisitorSuccess;
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
        
        [HttpPost]
        [Route("api/Visitor/Ipify")]
        public string Ipify(string visitorId, string IpAddress) {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.Ipfys.Add(new Ipfy() { VisitorId = visitorId, IpAddress = IpAddress, Occured = DateTime.Now });
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


