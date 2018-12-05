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

                    newComment.success = new EmailController().Post(new EmailMessageModel()
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

                        success = new EmailController().Post(new EmailMessageModel()
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
                            success = new EmailController().Post(new EmailMessageModel()
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

    [EnableCors("*", "*", "*")]
    public class DbArticleController : ApiController
    {
        [HttpGet]
        public IEnumerable<DbArticleModel> Get(int pageLen, int page, string filterType, string filter)
        {
            var articleList = new List<DbArticleModel>();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    IList<Article> dbArticles = null;
                    if (filter == null)
                        dbArticles = db.Articles.OrderByDescending(a => a.LastUpdated).Skip(page - 1).Take(pageLen).ToList();
                    else
                    {
                        switch (filterType)
                        {
                            case "Category":
                                dbArticles = db.Articles.Where(a=>a.CategoryRef==filter).OrderByDescending(a => a.LastUpdated).Skip(page - 1).Take(pageLen).ToList();
                                break;
                            case "Byline":
                                dbArticles = db.Articles.Where(a => a.ByLineRef == filter).OrderByDescending(a => a.LastUpdated).Skip(page - 1).Take(pageLen).ToList();
                                break;
                            default:
                                dbArticles = db.Articles.OrderByDescending(a => a.LastUpdated).Skip(page - 1).Take(pageLen).ToList();
                                break;
                        }
                    }

                    foreach (Article dbArticle in dbArticles)
                    {
                        var articleModel = new DbArticleModel();
                        articleModel.Id = dbArticle.Id.ToString();
                        articleModel.Title = dbArticle.Title;
                        articleModel.Byline = dbArticle.ByLineRef;
                        articleModel.Category = dbArticle.CategoryRef;
                        //articleModel.Byline = db.Refs.Where(r => r.RefCode == dbArticle.ByLineRef).FirstOrDefault().RefDescription;
                        //articleModel.Category = db.Refs.Where(r => r.RefCode == dbArticle.CategoryRef).FirstOrDefault().RefDescription;
                        //articleModel.SubCategory = db.Refs.Where(r => r.RefCode == dbArticle.SubCategoryRef).FirstOrDefault().RefDescription;
                        articleModel.ImageName = dbArticle.ImageName;
                        articleModel.Summary = dbArticle.Summary;
                        articleModel.Contents = dbArticle.Content;
                        articleModel.LastUpdated = dbArticle.LastUpdated.ToShortDateString();
                        //articleModel.DateCreated = dbArticle.Created.Value.ToLongDateString();
                        //articleModel.SortDate = dbArticle.LastUpdated.Value.ToString("yyyMMdd");
                        articleList.Add(articleModel);
                    }
                }
            }
            catch (Exception e)
            {
                articleList.Append(new DbArticleModel() { Title = "ERROR", Summary = e.Message });
            }
            return articleList;
        }

        [HttpGet]
        public IList<DbArticleModel> Get()
        {
            var articles = new List<DbArticleModel>();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    var dbArticles = db.Articles.ToList();
                    foreach (Article article in dbArticles)
                    {
                        articles.Add(new DbArticleModel()
                        {
                            Byline = article.ByLineRef,
                            Category = article.CategoryRef,
                            SubCategory = article.SubCategoryRef,
                            Contents = article.Content,
                            Summary = article.Summary,
                            ImageName = article.ImageName,
                            LastUpdated = article.LastUpdated.ToShortDateString()
                        });
                    }
                }
            }
            catch (Exception ex) { articles.Add(new DbArticleModel() { Title = Helpers.ErrorDetails(ex) }); }
            return articles;
        }

        [HttpGet]
        public DbArticleModel Get(string articleId)
        {
            var article = new DbArticleModel();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    Article dbArticle = db.Articles.Where(a => a.Id.ToString() == articleId).FirstOrDefault();
                    if (dbArticle != null)
                    {
                        article.Title = dbArticle.Title;
                        //article.Byline = db.Refs.Where(r => r.RefCode == dbArticle.ByLineRef).FirstOrDefault().RefDescription;
                        //article.Category = db.Refs.Where(r => r.RefCode == dbArticle.CategoryRef).FirstOrDefault().RefDescription;
                        //article.SubCategory = db.Refs.Where(r => r.RefCode == dbArticle.SubCategoryRef).FirstOrDefault().RefDescription;
                        article.Byline = dbArticle.ByLineRef;
                        article.Category = dbArticle.CategoryRef;
                        article.SubCategory = dbArticle.SubCategoryRef;
                        article.Contents = dbArticle.Content;
                        article.Summary = dbArticle.Summary;
                        //article.Created = dbArticle.Created;
                        //article.Updated = dbArticle.LastUpdated;
                        article.LastUpdated = dbArticle.LastUpdated.ToShortDateString();
                        article.ImageName = dbArticle.ImageName;
                        //article.SortDate = dbArticle.LastUpdated.Value.ToString("yyyyMMdd");
                        foreach (ArticleTag tag in dbArticle.ArticleTags)
                        {
                            article.Tags.Add(new DbArticleTagModel() { TagName = tag.TagName, Id = tag.Id, TagCategoryRef = tag.TagCategoryRef });
                        }   
                        article.Success = "ok";
                    }
                }
            }
            catch (Exception ex) { article.Success = Helpers.ErrorDetails(ex); }
            return article;
        }

        [HttpPost]
        public string Post(DbArticleModel articleModel)
        {
            var success = "";
            try
            {
                Article article = new Article();
                article.Id = Guid.NewGuid();
                article.Title = articleModel.Title;
                article.CategoryRef = articleModel.Category;
                article.SubCategoryRef = articleModel.SubCategory;
                article.ImageName = articleModel.ImageName;
                article.Created = DateTime.Now;
                article.LastUpdated = DateTime.Parse(articleModel.LastUpdated);
                article.Content = articleModel.Contents;
                article.Summary = articleModel.Summary;
                article.ByLineRef = articleModel.Byline;
                foreach (DbArticleTagModel tag in articleModel.Tags)
                    article.ArticleTags.Add(new ArticleTag() { TagName = tag.TagName, TagCategoryRef = tag.TagCategoryRef });
                using (WebSiteContext db = new WebSiteContext())
                {
                    db.Articles.Add(article);
                    db.SaveChanges();
                    success = article.Id.ToString();
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        public string Put(DbArticleModel editArticle)
        {
            var success = "";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    Article article = db.Articles.Where(a => a.Id.ToString() == editArticle.Id).FirstOrDefault();
                    if (article == null)
                        success = "article not found";
                    else
                    {
                        article.Title = editArticle.Title;
                        article.CategoryRef = editArticle.Category;
                        article.SubCategoryRef = editArticle.SubCategory;
                        article.ImageName = editArticle.ImageName;
                        article.LastUpdated = DateTime.Parse(editArticle.LastUpdated);
                        article.ByLineRef = editArticle.Byline;
                        article.Content = editArticle.Contents;
                        article.Summary = editArticle.Summary;

                        article.ArticleTags = null;
                        foreach (DbArticleTagModel tagModel in editArticle.Tags)
                        {
                            article.ArticleTags.Add(new ArticleTag() { articleId = article.Id, Id = tagModel.Id, TagCategoryRef = tagModel.TagCategoryRef, TagName = tagModel.TagName });
                        }
                        

                        db.SaveChanges();
                        success = "ok";
                    }
                }
            }
            catch (Exception ex) { success = "ERROR: " + Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class BlogController : ApiController
    {
        [HttpGet]
        public IList<BlogModel> Get()
        {
            var blogs = new List<BlogModel>();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    var dbBblogs = db.Blogs.ToList();
                    foreach (Blog blog in dbBblogs)
                    {
                        blogs.Add(new BlogModel() { Id = blog.Id.ToString(), Name = blog.BlogName, Owner = blog.BlogOwner });
                    }
                }
            }
            catch (Exception ex) { blogs.Add(new BlogModel() { Name = Helpers.ErrorDetails(ex) }); }
            return blogs;
        }

        [HttpGet]
        public BlogModel Get(string blogId)
        {
            var blog = new BlogModel();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    var dbBlog = db.Blogs.Where(b => b.Id.ToString() == blogId).FirstOrDefault();
                    if (dbBlog != null)
                    {
                        blog.Id = dbBlog.Id.ToString();
                        blog.Name = dbBlog.BlogName;
                        blog.Owner = dbBlog.BlogOwner;
                        foreach (BlogEntry entry in dbBlog.BlogEntries)
                        {
                            blog.Entries.Add(new BlogEntryModel()
                            {
                                Id = entry.Id.ToString(),
                                Summary = entry.Summary,
                                Contents = entry.Content,
                                Title = entry.Title

                            });

                        }
                    }
                }
            }
            catch (Exception ex) { blog.Name = "ERROR: " + Helpers.ErrorDetails(ex); }
            return blog;
        }

        [HttpPost]
        public string Post(BlogModel newBlog)
        {
            var success = "";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    Blog blog = new Blog();
                    blog.BlogName = newBlog.Name;
                    blog.BlogOwner = newBlog.Owner;
                    db.Blogs.Add(blog);
                    db.SaveChanges();
                    success = blog.Id.ToString();
                }
            }
            catch (Exception ex) { success = "ERROR: " + Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        public string Put(BlogModel editBlog)
        {
            var success = "";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    Blog blog = db.Blogs.Where(b => b.Id.ToString() == editBlog.Id).FirstOrDefault();
                    if (blog == null)
                        success = "article not found";
                    else
                    {
                        blog.BlogName = editBlog.Name;
                        blog.BlogOwner = editBlog.Owner;
                        db.SaveChanges();
                        success = "ok";
                    }
                }
            }
            catch (Exception ex) { success = "ERROR: " + Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class BlogEntryController : ApiController
    {
        //[HttpGet]
        //public IList<BlogEntryModel> Get(string blogId)
        //{
        //    var blogs = new List<BlogEntryModel>();
        //    try
        //    {
        //        using (WebSiteContext db = new WebSiteContext())
        //        {
        //            var dbBblogEntries = db.Blogs.ToList();
        //            foreach (Blog blog in dbBblogs)
        //            {
        //                blogs.Add(new BlogModel() { Id = blog.Id.ToString(), Name = blog.BlogName, Owner = blog.BlogOwner });
        //            }
        //        }
        //    }
        //    catch (Exception ex) { blogs.Add(new BlogModel() { Name = Helpers.ErrorDetails(ex) }); }
        //    return blogs;
        //}

        [HttpGet]
        public BlogEntryModel Get(string Id)
        {
            var blogEntry = new BlogEntryModel();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    var dbBlogEntry = db.BlogEntries.Where(b => b.Id.ToString() == Id).FirstOrDefault();
                    if (dbBlogEntry != null)
                    {
                        blogEntry.Title = dbBlogEntry.Title;
                        blogEntry.Summary = dbBlogEntry.Summary;
                        blogEntry.Contents = dbBlogEntry.Content;
                        blogEntry.ImageName = dbBlogEntry.ImageName;
                    }
                }
            }
            catch (Exception ex) { blogEntry.Title = "ERROR: " + Helpers.ErrorDetails(ex); }
            return blogEntry;
        }

        [HttpPost]
        public string Post(BlogEntryModel newBlogEntry)
        {
            var success = "";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    BlogEntry blogEntry = new BlogEntry();
                    blogEntry.Title = newBlogEntry.Title;
                    db.BlogEntries.Add(blogEntry);
                    db.SaveChanges();
                    success = blogEntry.Id.ToString();
                }
            }
            catch (Exception ex) { success = "ERROR: " + Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        public string Put(BlogEntryModel editBlogEntry)
        {
            var success = "";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    BlogEntry blogEntry = db.BlogEntries.Where(b => b.Id.ToString() == editBlogEntry.Id).FirstOrDefault();
                    if (blogEntry == null)
                        success = "article not found";
                    else
                    {
                        blogEntry.Title = editBlogEntry.Title;


                        db.SaveChanges();
                        success = "ok";
                    }
                }
            }
            catch (Exception ex) { success = "ERROR: " + Helpers.ErrorDetails(ex); }
            return success;
        }
    }
 
    public class Helpers
    {
        public static string ErrorDetails(Exception ex)
        {
            string msg = "ERROR: " + ex.Message;
            if (ex.GetType() == typeof(DbEntityValidationException))
            {
                var ee = (DbEntityValidationException)ex;
                foreach (DbEntityValidationResult eve in ee.EntityValidationErrors)
                {
                    msg += string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:", eve.Entry.Entity.GetType().Name, eve.Entry.State);
                    foreach (var dbe in eve.ValidationErrors)
                    {
                        msg += string.Format("- Property: \"{0}\", Error: \"{1}\"", dbe.PropertyName, dbe.ErrorMessage);
                    }
                }
            }
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                msg = ex.Message;
            }
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

        public static string DateName(string dateMonth)
        {
            switch (dateMonth)
            {
                case "1": return "Jan";
                case "2": return "Feb";
                case "3": return "Mar";
                case "4": return "April";
                case "5": return "May";
                case "6": return "June";
                case "7": return "July";
                case "8": return "Aug";
                case "9": return "Sept";
                case "10": return "Oct";
                case "11": return "Nov";
                case "12": return "Dec";
                default: return dateMonth;
            }
        }


    }
}



