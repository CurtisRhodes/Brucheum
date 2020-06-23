using OggleBooble.Api.MySqlDataContext;
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

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class CommonController : ApiController
    {
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
        public PageHitSuccessModel LogPageHit(string visitorId, int pageId)
        {
            PageHitSuccessModel pageHitSuccessModel = new PageHitSuccessModel();
            try
            {
                using (var mdb = new MySqlDataContext.OggleBoobleMySqlContext())
                {
                    var twoMinutesAgo = DateTime.Now.AddMinutes(-2);

                    var lastHit = mdb.PageHits.Where(h => h.VisitorId == visitorId && h.PageId == pageId && h.Occured > twoMinutesAgo).FirstOrDefault();
                    if (lastHit == null)
                    {
                        mdb.PageHits.Add(new MySqlDataContext.PageHit()
                        {
                            VisitorId = visitorId,
                            PageId = pageId,
                            Occured = DateTime.Now  //.AddMilliseconds(getrandom.Next())
                        });
                        mdb.SaveChanges();
                    }
                    pageHitSuccessModel.PageHits = mdb.PageHits.Where(h => h.PageId == pageId).Count();
                    var dbPageHitTotals = mdb.PageHitTotal.Where(h => h.PageId == pageId).FirstOrDefault();
                    if (dbPageHitTotals != null)
                    {
                        pageHitSuccessModel.PageHits += dbPageHitTotals.Hits;
                    }
                    pageHitSuccessModel.UserPageHits = mdb.PageHits.Where(h => h.VisitorId == visitorId).Count();
                    pageHitSuccessModel.UserImageHits = mdb.ImageHits.Where(h => h.VisitorId == visitorId).Count();

                    MySqlDataContext.CategoryFolder categoryFolder = mdb.CategoryFolders.Where(f => f.Id == pageId).FirstOrDefault();
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
                            MySqlDataContext.CategoryFolder parentFolder = mdb.CategoryFolders.Where(f => f.Id == categoryFolder.Parent).FirstOrDefault();
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

        //api/ImageHit/LogImageHit
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
                            PageId = logImageHItData.PageId,
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
                using (var mdb = new MySqlDataContext.OggleBoobleMySqlContext())
                {
                    DateTime lastVisitDate = DateTime.MinValue;
                    List<MySqlDataContext.Visit> visitorVisits = mdb.Visits.Where(v => v.VisitorId == visitorId).ToList();
                    if (visitorVisits.Count() > 0)
                        lastVisitDate = mdb.Visits.Where(v => v.VisitorId == visitorId).OrderByDescending(v => v.VisitDate).FirstOrDefault().VisitDate;
                    else {
                        visitSuccessModel.IsNewVisitor = true;
                    }

                    if ((lastVisitDate == DateTime.MinValue) || ((DateTime.Now - lastVisitDate).TotalHours > 12))
                    {
                        MySqlDataContext.Visitor visitor = mdb.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                        if (visitor == null)
                        {
                            mdb.Visits.Add(new MySqlDataContext.Visit()
                            {
                                VisitorId = visitorId,
                                VisitDate = DateTime.Now
                            });
                            mdb.SaveChanges();
                            visitSuccessModel.VisitAdded = true;
                            if (!visitSuccessModel.IsNewVisitor) {
                                var registeredUser = mdb.RegisteredUsers.Where(u => u.VisitorId == visitorId).FirstOrDefault();
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
                using (var mdb = new MySqlDataContext.OggleBoobleMySqlContext())
                {
                    var dupIp = mdb.IpInfoCalls.Where(ip => ip.IpAddress == visitorData.IpAddress).FirstOrDefault();
                    if (dupIp != null)
                        addVisitorSuccess.EventDetail = "duplicate call to IpInfo. ";

                    MySqlDataContext.CategoryFolder categoryFolder = mdb.CategoryFolders.Where(f => f.Id == visitorData.PageId).FirstOrDefault();
                    if (categoryFolder != null)
                        addVisitorSuccess.PageName = categoryFolder.FolderName;

                    string newVisitorId = Guid.NewGuid().ToString();
                    var existingVisitor = mdb.Visitors.Where(v => v.IpAddress == visitorData.IpAddress).FirstOrDefault();
                    if (existingVisitor != null)
                    {
                        addVisitorSuccess.VisitorId = existingVisitor.VisitorId;
                        addVisitorSuccess.EventDetail += "Visitor Id already exists";
                        var registeredUser = mdb.RegisteredUsers.Where(u => u.VisitorId == existingVisitor.VisitorId).FirstOrDefault();
                        if (registeredUser != null)
                            addVisitorSuccess.UserName = registeredUser.UserName;
                    }
                    else
                    {
                        // We have a new visitor!
                        var newVisitor = new MySqlDataContext.Visitor()
                        {
                            VisitorId = newVisitorId,
                            InitialPage = visitorData.PageId,
                            City = visitorData.City,
                            Country = visitorData.Country,
                            GeoCode = visitorData.GeoCode,
                            Region = visitorData.Region,
                            InitialVisit = DateTime.Now,
                            IpAddress = visitorData.IpAddress
                        };
                        mdb.Visitors.Add(newVisitor);
                        addVisitorSuccess.EventDetail += "New visitor added";
                    }
                    mdb.IpInfoCalls.Add(new MySqlDataContext.IpInfoCall()
                    {
                        IpAddress = visitorData.IpAddress,
                        Occured = DateTime.Now
                    });

                    mdb.SaveChanges();
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
                using (var mdb = new MySqlDataContext.OggleBoobleMySqlContext())
                {
                    mdb.ErrorLogs.Add(new MySqlDataContext.ErrorLog()
                    {
                        PkId = Guid.NewGuid().ToString(),
                        VisitorId = logErrorModel.VisitorId,
                        ActivityCode = logErrorModel.ActivityCode,
                        ErrorMessage = logErrorModel.ErrorMessage,
                        CalledFrom = logErrorModel.CalledFrom,
                        Severity = logErrorModel.Severity,
                        Occured = DateTime.Now
                    });
                    mdb.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpPost]
        [Route("api/Common/LogActivity")]
        public string LogActivity(LogActivityModel logEventModel)
        {
            string success;
            try
            {
                using (var mdb = new MySqlDataContext.OggleBoobleMySqlContext())
                {
                    logEventModel.EventDetail = mdb.CategoryFolders.Where(f => f.Id == logEventModel.PageId).FirstOrDefault().FolderName;
                    mdb.EventLogs.Add(new MySqlDataContext.EventLog()
                    {
                        EventCode = logEventModel.EventCode,
                        EventDetail = logEventModel.EventDetail,
                        PageId = logEventModel.PageId,
                        VisitorId = logEventModel.VisitorId,
                        Occured = DateTime.Now
                    });
                    mdb.SaveChanges();
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
        public string LogDataActivity(ChangeLogModel changeLog)
        {
            string success;
            try            
            {
                using (var db = new OggleBoobleMSSqlContext())
                {
                    var dataAction = new ChangeLog();
                    //dataAction.PkId = Guid.NewGuid().ToString();
                    dataAction.PageId = 1144;
                    dataAction.PageName = changeLog.PageName;
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
                using (var mdb = new MySqlDataContext.OggleBoobleMySqlContext())
                {
                    mdb.FeedBacks.Add(new MySqlDataContext.FeedBack()
                    {
                        FeedBackComment = feedBackModel.FeedBackComment,
                        FeedBackType = feedBackModel.FeedBackType,
                        FeedBackEmail = feedBackModel.FeedBackEmail,
                        VisitorId = feedBackModel.VisitorId,
                        Occured = DateTime.Now
                    });
                    mdb.SaveChanges();
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
                using (var mdb = new OggleBoobleMySqlContext())
                {
                    var dbRefs = mdb.Refs.Where(r => r.RefType == refType).ToList();
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

        [HttpGet]
        [Route("api/UserSettings/Get")]
        public SuccessModel GetUserSettings(string visitorId)
        {
            var successModel = new SuccessModel();
            try
            {
                using (var mdb = new OggleBoobleMySqlContext())
                {
                    successModel.ReturnValue = mdb.RegisteredUsers.Where(u => u.VisitorId == visitorId).FirstOrDefault().UserSettings;
                }
                successModel.Success = "ok";
            }
            catch (Exception ex)
            {
                successModel.Success = Helpers.ErrorDetails(ex);
            }
            return successModel;
        }

        [HttpPut]
        [Route("api/EntityAttribute/Update")]
        public SuccessModel UpdateUserSettings(string userName, string settingName, string settingJson)
        {
            var successModel = new SuccessModel();
            try
            {
                using (var mdb = new OggleBoobleMySqlContext())
                {
                    // replace section
                    var dbUser = mdb.RegisteredUsers.Where(r => r.UserName == userName).FirstOrDefault();
                    var currentSettings = dbUser.UserSettings;

                    int startindex = currentSettings.IndexOf(settingName);
                    int lenToEnd = currentSettings.Substring(startindex, currentSettings.IndexOf("}") + 1).Length;
                    string elementRemoved = currentSettings.Remove(startindex, lenToEnd);
                    dbUser.UserSettings = elementRemoved + settingJson;

                    mdb.SaveChanges();
                    successModel.Success = "ok";
                    successModel.ReturnValue = dbUser.UserSettings;
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
