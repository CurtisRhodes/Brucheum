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
        public UpdateVisitorSuccessModel UpdateVisitor(AddVisitorModel visitorData) {
            var updateVisitorSuccessModel = new UpdateVisitorSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    Visitor visitor1 = db.Visitors.Where(v => v.VisitorId == visitorData.VisitorId).FirstOrDefault();
                    if (visitor1 == null)
                        updateVisitorSuccessModel.Message1 = "VisitorId not found";
                    else
                    {
                        Visitor visitor2 = db.Visitors.Where(v => v.IpAddress == visitorData.IpAddress).FirstOrDefault();
                        if (visitor2 == null)
                        {
                            updateVisitorSuccessModel.Message1 = "New Ip Visitor Updated";
                            visitor1.IpAddress = visitorData.IpAddress;
                            visitor1.City = visitorData.City;
                            visitor1.Country = visitorData.Country;
                            visitor1.GeoCode = visitorData.GeoCode;
                            visitor1.Region = visitorData.Region;
                            if (visitor1.InitialPage == 0)
                                visitor1.InitialPage = visitorData.InitialPage;
                            db.SaveChanges();

                            if (visitor1.Country == "ZZ")
                                updateVisitorSuccessModel.Message2 = "ZZ Visitor Updated";
                            else
                                updateVisitorSuccessModel.Message2 = "no ZZ Visitor Updated";
                        }
                        else //  IpAddress Dupe Problem
                        {
                            updateVisitorSuccessModel.Message1 = "Existing IP";
                            updateVisitorSuccessModel.VisitorId = visitor2.VisitorId;
                            if (visitor1.Country == "ZZ")
                            {
                                db.Visitors.Remove(visitor1);
                                db.SaveChanges();
                                updateVisitorSuccessModel.Message2 = "Existing Ip found. ZZ removed";
                            }
                            else
                            {

                                if (visitor2.GeoCode != visitorData.GeoCode)
                                {
                                    visitor2.GeoCode = visitorData.GeoCode;
                                    db.SaveChanges();
                                    updateVisitorSuccessModel.Message2 = "Existing Ip new GeoCode";
                                }
                                if (visitor2.InitialPage == 0)
                                {
                                    updateVisitorSuccessModel.Message2 += "Initial Page updated";
                                    visitor2.InitialPage = visitorData.InitialPage;
                                    db.SaveChanges();
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
        public SuccessModel VerifyVisitor(string visitorId)
        {
            SuccessModel successModel = new SuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    Visitor dbVisitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                    if (dbVisitor == null)
                        successModel.ReturnValue = "not found";
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


