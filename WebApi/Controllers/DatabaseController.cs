using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Net.Mail;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Results;
using WebApi.Models;

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
        private string GetUniqueRefCode(string refDescription,WebSiteContext db)
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
    public class CommentsController : ApiController
    {
        // GET: api/Comments
        public IList<CommentsModel> Get(string articleId)
        {
            var results = new List<CommentsModel>();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    List<Comment> comments = db.Comments.Where(c => c.ArticleId == articleId).ToList();
                    foreach (Comment c in comments)
                    {
                        results.Add(new CommentsModel()
                        {
                            UserName = c.UserName,
                            UserId = c.UserId,
                            CommentId = c.CommentId,
                            CommentTitle = c.CommentTitle,
                            CommentText = c.CommentText,
                            CreateDate = c.CreateDate.ToShortDateString()
                        });
                    }

                    //results = (from comments in db.Comments
                    //           join users in dbn.AspNetUsers on comments.UserId.ToString() equals users.Id
                    //           where comments.ArticleId.ToString() == articleId.ToString().ToUpper()
                    //           orderby comments.CreateDate ascending
                    //           select new CommentsModel
                    //           {
                    //               UserName = users.UserName,
                    //               UserId = users.Id,
                    //               CreateDate = comments.CreateDate,
                    //               CommentTitle = comments.CommentTitle,
                    //               CommentText = comments.CommentText
                    //           }).ToList().AsQueryable();

                }
            }
            catch (Exception ex)
            {
                results.Add(new CommentsModel() { CommentText = Helpers.ErrorDetails(ex) });
                //results = results.Concat(new[] { new CommentsModel() { success = Helpers.ErrorDetails(ex) } });
            }
            return results; //Json(results, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public CommentsModel Post(CommentsModel newComment)
        {
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    var comment = new Comment();
                    comment.CreateDate = DateTime.Now;
                    comment.ArticleId = newComment.ArticleId;
                    comment.CommentText = newComment.CommentText;
                    comment.CommentTitle = newComment.CommentTitle;
                    comment.UserId = newComment.UserId;
                    comment.UserName = newComment.UserName;
                    db.Comments.Add(comment);
                    db.SaveChanges();

                    newComment.CommentId = comment.CommentId;
                    newComment.CreateDate = comment.CreateDate.ToShortDateString();
                    newComment.success = "ok";

                    newComment.success = new EmailController().Send(new EmailMessage()
                    {
                        Subject = "Somebody Actually Made A comment",
                        Body = comment.UserName + " said: " + comment.CommentText
                    });
                }
            }
            catch (Exception ex)
            {
                newComment.success = "ERROR: " + Helpers.ErrorDetails(ex);
            }
            return newComment;
        }

        [HttpPut]
        public string Put(Comment updateComment)
        {
            string success = "";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    Comment comment = db.Comments.Where(c => c.CommentId == updateComment.CommentId).FirstOrDefault();
                    if (comment != null)
                    {
                        comment.CommentText = updateComment.CommentText;
                        comment.CommentTitle = updateComment.CommentTitle;

                        db.SaveChanges();
                        success = "ok";
                    }
                    else
                        success = "comment not found";
                }
            }
            catch (Exception ex)
            {
                success = "ERROR: " + Helpers.ErrorDetails(ex);
            }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class HitCounterController : ApiController
    {
        [HttpGet]
        public string LogVisit(string ipAddress, string app)
        {
            string success = "";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    Visitor existing = db.Visitors.Where(v => v.IPAddress == ipAddress && v.App == app).FirstOrDefault();

                    // ERROR: The entity or complex type 'WebApi.Visitor' cannot be constructed in a LINQ to Entities query.
                    // Visitor aVisitor = (from visitors in db.Visitors
                    //                        where visitors.IPAddress == ipAddress && visitors.App == app
                    //                        select new Visitor() { IPAddress = visitors.IPAddress }).FirstOrDefault();
                    if (existing == null)
                    {
                        // WE HAVE A NEW VISITOR
                        Visitor visitor = new Visitor();
                        visitor.App = app;
                        visitor.IPAddress = ipAddress;
                        visitor.CreateDate = DateTime.Now;

                        db.Visitors.Add(visitor);
                        db.SaveChanges();

                        success = new EmailController().Send(new EmailMessage()
                        {
                            Subject = "CONGRATULATIONS: someone just visited your site",
                            Body = "ip: " + ipAddress + " visited: " + app
                        });
                        ////emailSuccess = Helpers.SendEmail("CONGRATULATIONS: someone just visited your site", "ip: " + ipAddress + " visited: " + app);
                        //if (emailSuccess != "ok")
                        //    success = "true but " + emailSuccess;
                        //else
                        //    success = "ok";
                    }
                    else
                    {
                        // add  Vist
                        Visit visit = new Visit();
                        visit.IPAddress = ipAddress;
                        visit.App = app;
                        visit.VisitDate = DateTime.Now;

                        db.Visits.Add(visit);
                        db.SaveChanges();

                        if (ipAddress != "50.62.160.105")  // could be something at Godaddy
                        {
                            success = new EmailController().Send(new EmailMessage()
                            {
                                Subject = "Site Visit",
                                Body = "ip: " + ipAddress + " visited: " + app
                            });
                        }
                    }
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpGet]
        public string AddPageHit(string ipAddress, string app, string page, string details)
        {
            string success = "ERROR: ohno";
            try
            {
                //var ipAddress = System.Text.Encoding.UTF32.GetString(bytes);
                using (WebSiteContext db = new WebSiteContext())
                {
                    Hit hit = new Hit();
                    hit.IPAddress = ipAddress;
                    hit.App = app;
                    hit.BeginView = DateTime.Now;
                    hit.PageName = page;
                    hit.Details = details;
                    db.Hits.Add(hit);
                    db.SaveChanges();

                    success = hit.HitId.ToString();
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpGet]
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

    public class Helpers
    {
        public static string ErrorDetails(Exception ex)
        {
            var exceptionType = ex.GetBaseException();
            string msg = "ERROR: " + ex.Message;
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                msg = ex.Message;

            }
            //if(ex.GetBaseException)
            //msg + 
            //catch (DbEntityValidationException ve)
            //{
            //    success = "ERROR: ";
            //    foreach (DbEntityValidationResult e in ve.EntityValidationErrors)
            //    {
            //        foreach (var eve in ve.EntityValidationErrors)
            //        {
            //            //Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:", eve.Entry.Entity.GetType().Name, eve.Entry.State);
            //            success += string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:", eve.Entry.Entity.GetType().Name, eve.Entry.State);
            //            foreach (var dbe in eve.ValidationErrors)
            //            {
            //                //Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"", dbe.PropertyName, dbe.ErrorMessage);
            //                success += string.Format("- Property: \"{0}\", Error: \"{1}\"", dbe.PropertyName, dbe.ErrorMessage);
            //            }
            //        }
            //    }
            //}
            ////catch (System.Data.SqlClient.SqlErrorCollection. eee)
            //{ }

            return msg;
        }

        //public static string SendEmail(string subjectLine, string message)
        //{
        //    string success = "";
        //    try
        //    {
        //        SmtpClient smtp = new SmtpClient("relay-hosting.secureserver.net", 25);
        //        MailMessage mailMessage = new MailMessage("info@curtisrhodes.com", "Curtishrhodes@hotmail.com");
        //        mailMessage.Subject = subjectLine;
        //        mailMessage.Body = message;
        //        smtp.Send(mailMessage);
        //        success = "ok";
        //    }
        //    catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
        //    return success;
        //}

    }
}



