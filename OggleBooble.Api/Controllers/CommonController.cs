﻿using OggleBooble.Api.MySqlDataContext;
using OggleBooble.Api.MSSqlDataContext;
using OggleBooble.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Data.Entity.Validation;
using System.Runtime.InteropServices;
using System.Web;
using System.Net.Mail;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class CommonController : ApiController
    {
        [HttpPut]
        [Route("api/Common/SendEmail")]
        public string SendEmail(EmailMessageModel message)
        {
            string success = "";
            try
            {
                using (SmtpClient smtpClient = new SmtpClient("relay-hosting.secureserver.net", 25))
                {
                    MailMessage mailMessage = new MailMessage("info@api.Ogglebooble.com", "CurtishRhodes@hotmail.com", message.Subject, message.Message);
                    mailMessage.IsBodyHtml = true;
                    smtpClient.Send(mailMessage);
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpGet]
        [Route("api/Common/VerifyConnection")]
        public VerifyConnectionSuccessModel VerifyConnection()
        {
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            VerifyConnectionSuccessModel successModel = new VerifyConnectionSuccessModel() { ConnectionVerified = false };
            try
            {
                //using (var db = new OggleBoobleMySqlContext())
                using (var db = new OggleBoobleMSSqlContext())
                {
                    var test = db.CategoryFolders.Where(f => f.Id == 1).FirstOrDefault();
                    successModel.ConnectionVerified = true;
                }
                timer.Stop();
                //successModel.ReturnValue = timer.Elapsed.ToString();
                System.Diagnostics.Debug.WriteLine("VerifyConnection took: " + timer.Elapsed);
                successModel.Success = "ok";
            }
            catch (Exception ex)
            {
                successModel.Success = Helpers.ErrorDetails(ex);
            }
            return successModel;
        }

        [HttpPost]
        [Route("api/Common/LogPageHit")]
        public PageHitSuccessModel LogPageHit(string visitorId, int folderId)
        {
            PageHitSuccessModel pageHitSuccessModel = new PageHitSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var twoMinutesAgo = DateTime.Now.AddMinutes(-2);

                    var lastHit = db.PageHits.Where(h => h.VisitorId == visitorId && h.PageId == folderId && h.Occured > twoMinutesAgo).FirstOrDefault();
                    if (lastHit == null)
                    {
                        db.PageHits.Add(new PageHit()
                        {
                            VisitorId = visitorId,
                            PageId = folderId,
                            Occured = DateTime.Now  //.AddMilliseconds(getrandom.Next())
                        });
                        db.SaveChanges();
                    }
                    pageHitSuccessModel.PageHits = db.PageHits.Where(h => h.PageId == folderId).Count();
                    var dbPageHitTotals = db.PageHitTotal.Where(h => h.PageId == folderId).FirstOrDefault();
                    if (dbPageHitTotals != null)
                    {
                        pageHitSuccessModel.PageHits += dbPageHitTotals.Hits;
                    }
                    pageHitSuccessModel.UserPageHits = db.PageHits.Where(h => h.VisitorId == visitorId).Count();
                    pageHitSuccessModel.UserImageHits = db.ImageHits.Where(h => h.VisitorId == visitorId).Count();

                    VirtualFolder categoryFolder = db.VirtualFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    if (categoryFolder != null)
                    {
                        pageHitSuccessModel.RootFolder = categoryFolder.RootFolder;
                        pageHitSuccessModel.PageName = categoryFolder.FolderName;

                        if (categoryFolder.Parent == -1)
                        {
                            pageHitSuccessModel.ParentName = "special";
                        }
                        else
                        {
                            VirtualFolder parentFolder = db.VirtualFolders.Where(f => f.Id == categoryFolder.Parent).FirstOrDefault();
                            if (parentFolder != null)
                                pageHitSuccessModel.ParentName = parentFolder.FolderName;
                        }
                    }
                    else
                        pageHitSuccessModel.PageName = "Not Found";
                }
                pageHitSuccessModel.Success = "ok";
            }
            catch (Exception ex)
            {
                pageHitSuccessModel.Success = Helpers.ErrorDetails(ex);
            }
            return pageHitSuccessModel;
        }

        bool imageHitControllerBusy = false;
        [HttpPost]
        [Route("api/Common/LogImageHit")]
        public ImageHitSuccessModel LogImageHit(LogImageHitDataModel logImageHItData)
        {
            ImageHitSuccessModel imageHitSuccess = new ImageHitSuccessModel();
            try
            {
                //System.Threading.Thread.Sleep(1000);
                if (imageHitControllerBusy)
                    imageHitSuccess.Success = "imageHitController Busy";
                else
                {
                    imageHitControllerBusy = true;
                    using (var dbm = new OggleBoobleMySqlContext())
                    {
                        //DateTime utcDateTime = DateTime.UtcNow.AddMilliseconds(getrandom.Next());
                        //imageHitSuccess.HitDateTime = utcDateTime;
                        dbm.ImageHits.Add(new ImageHit()
                        {
                            VisitorId = logImageHItData.VisitorId,
                            PageId = logImageHItData.FolderId,
                            ImageLinkId = logImageHItData.LinkId,
                            HitDateTime = DateTime.Now
                        });
                        dbm.SaveChanges();
                        imageHitSuccess.UserImageHits = dbm.ImageHits.Where(h => h.VisitorId == logImageHItData.VisitorId).Count();
                        imageHitSuccess.UserPageHits = dbm.PageHits.Where(h => h.VisitorId == logImageHItData.VisitorId).Count();
                        imageHitSuccess.ImageHits = dbm.ImageHits.Where(h => h.ImageLinkId == logImageHItData.LinkId).Count();
                        imageHitControllerBusy = false;
                    }
                }
                imageHitSuccess.Success = "ok";
            }
            catch (DbEntityValidationException dbEx)
            {
                imageHitSuccess.Success = Helpers.ErrorDetails(dbEx);
            }
            catch (Exception ex)
            {
                imageHitSuccess.Success = Helpers.ErrorDetails(ex);
            }
            return imageHitSuccess;
        }

        [HttpPost]
        [Route("api/Common/LogVisit")]
        public LogVisitSuccessModel LogVisit(string visitorId)
        {
            LogVisitSuccessModel visitSuccessModel = new LogVisitSuccessModel() { VisitAdded = false, IsNewVisitor = false };
            try
            {
                using (var db = new MySqlDataContext.OggleBoobleMySqlContext())
                {
                    DateTime lastVisitDate = DateTime.MinValue;
                    List<MySqlDataContext.Visit> visitorVisits = db.Visits.Where(v => v.VisitorId == visitorId).ToList();
                    if (visitorVisits.Count() > 0)
                        lastVisitDate = db.Visits.Where(v => v.VisitorId == visitorId).OrderByDescending(v => v.VisitDate).FirstOrDefault().VisitDate;
                    else {
                        visitSuccessModel.IsNewVisitor = true;
                    }

                    if ((lastVisitDate == DateTime.MinValue) || ((DateTime.Now - lastVisitDate).TotalHours > 12))
                    {
                        MySqlDataContext.Visitor visitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                        if (visitor == null)
                        {
                            db.Visits.Add(new MySqlDataContext.Visit()
                            {
                                VisitorId = visitorId,
                                VisitDate = DateTime.Now
                            });
                            db.SaveChanges();
                            visitSuccessModel.VisitAdded = true;
                            if (!visitSuccessModel.IsNewVisitor) {
                                var registeredUser = db.RegisteredUsers.Where(u => u.VisitorId == visitorId).FirstOrDefault();
                                if (registeredUser != null)
                                    visitSuccessModel.UserName = " " + registeredUser.UserName;
                                else
                                    visitSuccessModel.UserName = ". Please log in";
                            }
                        }
                    }
                    visitSuccessModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                visitSuccessModel.Success = Helpers.ErrorDetails(ex);
            }
            return visitSuccessModel;
        }

        [HttpPost]
        [Route("api/Common/AddVisitor")]
        public AddVisitorSuccessModel AddVisitor(AddVisitorModel visitorData)
        {
            var addVisitorSuccess = new AddVisitorSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dupIp = db.IpInfoCalls.Where(ip => ip.IpAddress == visitorData.IpAddress).FirstOrDefault();
                    if (dupIp != null)
                        addVisitorSuccess.EventDetail = "duplicate call to IpInfo. ";

                    VirtualFolder categoryFolder = db.VirtualFolders.Where(f => f.Id == visitorData.FolderId).FirstOrDefault();
                    if (categoryFolder != null)
                        addVisitorSuccess.PageName = categoryFolder.FolderName;

                    string newVisitorId = Guid.NewGuid().ToString();
                    var existingVisitor = db.Visitors.Where(v => v.IpAddress == visitorData.IpAddress).FirstOrDefault();
                    if (existingVisitor != null)
                    {
                        addVisitorSuccess.VisitorId = existingVisitor.VisitorId;
                        addVisitorSuccess.EventDetail += "Visitor Id already exists";
                        var registeredUser = db.RegisteredUsers.Where(u => u.VisitorId == existingVisitor.VisitorId).FirstOrDefault();
                        if (registeredUser != null)
                            addVisitorSuccess.UserName = registeredUser.UserName;
                    }
                    else
                    {
                        // We have a new visitor!
                        var newVisitor = new Visitor()
                        {
                            VisitorId = newVisitorId,
                            InitialPage = visitorData.FolderId,
                            City = visitorData.City,
                            Country = visitorData.Country,
                            GeoCode = visitorData.GeoCode,
                            Region = visitorData.Region,
                            InitialVisit = DateTime.Now,
                            IpAddress = visitorData.IpAddress
                        };
                        db.Visitors.Add(newVisitor);
                        addVisitorSuccess.EventDetail += "New visitor added";
                    }
                    db.IpInfoCalls.Add(new MySqlDataContext.IpInfoCall()
                    {
                        IpAddress = visitorData.IpAddress,
                        Occured = DateTime.Now
                    });

                    db.SaveChanges();
                    addVisitorSuccess.VisitorId = newVisitorId;

                    addVisitorSuccess.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                addVisitorSuccess.Success = Helpers.ErrorDetails(ex);
            }
            return addVisitorSuccess;
        }

        [HttpPost]
        [Route("api/Common/LogError")]
        public string LogError(LogErrorModel logErrorModel)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.ErrorLogs.Add(new ErrorLog()
                    {
                        PkId = Guid.NewGuid().ToString(),
                        VisitorId = logErrorModel.VisitorId,
                        ErrorCode = logErrorModel.ErrorCode,
                        ErrorMessage = logErrorModel.ErrorMessage,
                        CalledFrom = logErrorModel.CalledFrom,
                        PageId = logErrorModel.FolderId,
                        Occured = DateTime.Now
                    });
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
        
        [HttpPost]
        [Route("api/Common/LogEvent")]
        public string LogEvent(EventLogModel eventModel)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.EventLogs.Add(new EventLog()
                    {
                        EventCode = eventModel.EventCode,
                        EventDetail = eventModel.EventDetail,
                        PageId = eventModel.FolderId,
                        VisitorId = eventModel.VisitorId,
                        Occured = DateTime.Now
                    });
                    db.SaveChanges();
                }
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpPost]
        [Route("api/Common/LogDataActivity")]
        public string LogDataActivity(DataActivityModel changeLog)
        {
            string success;
            try            
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dataAction = new MySqlDataContext.ChangeLog();
                    dataAction.PkId = Guid.NewGuid().ToString();
                    dataAction.VisitorId = changeLog.VisitorId;
                    dataAction.PageId = changeLog.FolderId;
                    dataAction.ActivityCode = changeLog.ActivityCode;
                    dataAction.Activity = changeLog.Activity;
                    dataAction.Occured = DateTime.Now;
                    db.ChangeLogs.Add(dataAction);
                    db.SaveChanges();
                }
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpPost]
        [Route("api/Common/LogFeedback")]
        public string LogFeedback(FeedBackModel feedBackModel)
        {
            string success;
            try
            {
                using (var db = new MySqlDataContext.OggleBoobleMySqlContext())
                {
                    db.FeedBacks.Add(new MySqlDataContext.FeedBack()
                    {
                        FeedBackComment = feedBackModel.FeedBackComment,
                        FeedBackType = feedBackModel.FeedBackType,
                        FeedBackEmail = feedBackModel.FeedBackEmail,
                        VisitorId = feedBackModel.VisitorId,
                        Occured = DateTime.Now
                    });
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
    public class EntityAttributeController : ApiController
    {
        [HttpGet]
        [Route("api/EntityAttribute/GetRefs")]
        public RefSuccessModel GetRefs(string refType)
        {
            RefSuccessModel refs = new RefSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbRefs = db.Refs.Where(r => r.RefType == refType).ToList();
                    foreach (Ref dbRef in dbRefs)
                    {
                        refs.RefItems.Add(new RefItemModel()
                        {
                            RefCode = dbRef.RefCode,
                            RefType = dbRef.RefType,
                            RefDescription = dbRef.RefDescription
                        });
                    }
                    refs.Success = "ok";
                }
            }
            catch (Exception ex) { refs.Success = Helpers.ErrorDetails(ex); }
            return refs;
        }

    }
}
