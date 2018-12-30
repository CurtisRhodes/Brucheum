 using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WebApi.Articles.Models;
using WebApi.WebSite.DataContext;

namespace WebApi.Articles
{
    [System.Web.Http.Cors.EnableCors("*", "*", "*")] 
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
                    switch (filterType)
                    {
                        case "Category":
                            dbArticles = db.Articles.Where(a => a.CategoryRef == filter).OrderByDescending(a => a.LastUpdated).Skip(page - 1).Take(pageLen).ToList();
                            break;
                        case "Byline":
                            dbArticles = db.Articles.Where(a => a.ByLineRef == filter).OrderByDescending(a => a.LastUpdated).Skip(page - 1).Take(pageLen).ToList();
                            break;
                        default:
                            dbArticles = db.Articles.OrderByDescending(a => a.LastUpdated).Skip(page - 1).Take(pageLen).ToList();
                            break;
                    }

                    foreach (Article dbArticle in dbArticles)
                    {
                        var articleModel = new DbArticleModel();
                        articleModel.Id = dbArticle.Id.ToString();
                        articleModel.Title = dbArticle.Title;
                        articleModel.ByLineRef = dbArticle.ByLineRef;
                        articleModel.CategoryRef = dbArticle.CategoryRef;
                        articleModel.SubCategoryRef = dbArticle.SubCategoryRef;

                        try { articleModel.ByLineLabel = db.Refs.Where(r => r.RefCode == dbArticle.ByLineRef).FirstOrDefault().RefDescription; }
                        catch (Exception) { articleModel.ByLineLabel = "0"; }

                        try { articleModel.CategoryLabel = db.Refs.Where(r => r.RefCode == dbArticle.CategoryRef).FirstOrDefault().RefDescription; }
                        catch (Exception ex) { articleModel.CategoryLabel = Helpers.ErrorDetails(ex); }

                        try { articleModel.SubCategoryLabel = db.Refs.Where(r => r.RefCode == dbArticle.SubCategoryRef).FirstOrDefault().RefDescription; }
                        catch (Exception ex) { articleModel.SubCategoryLabel = Helpers.ErrorDetails(ex); }

                        articleModel.ImageName = dbArticle.ImageName;
                        articleModel.Summary = dbArticle.Summary;
                        articleModel.Contents = dbArticle.Content;
                        articleModel.LastUpdated = dbArticle.LastUpdated.ToShortDateString();
                        articleList.Add(articleModel);
                    }
                }
            }
            catch (Exception ex)
            {
                articleList.Append(new DbArticleModel() { Title = "ERROR", Summary = Helpers.ErrorDetails(ex) });
            }
            return articleList;
        }

        [HttpGet]
        public DbArticleModel Get(string articleId)
        {
            var articleModel = new DbArticleModel();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    Article dbArticle = db.Articles.Where(a => a.Id.ToString() == articleId).FirstOrDefault();
                    if (dbArticle != null)
                    {
                        articleModel.Title = dbArticle.Title;

                        try { articleModel.ByLineLabel = db.Refs.Where(r => r.RefCode == dbArticle.ByLineRef).FirstOrDefault().RefDescription; }
                        catch (Exception ex) { articleModel.ByLineLabel = Helpers.ErrorDetails(ex); }

                        try { articleModel.CategoryLabel = db.Refs.Where(r => r.RefCode == dbArticle.CategoryRef).FirstOrDefault().RefDescription; }
                        catch (Exception ex) { articleModel.CategoryLabel = Helpers.ErrorDetails(ex); }

                        //try { articleModel.SubCategoryLabel = db.Refs.Where(r => r.RefCode == dbArticle.SubCategoryRef).FirstOrDefault().RefDescription; }
                        //catch (Exception ex) { articleModel.SubCategoryLabel = Helpers.ErrorDetails(ex); }

                        articleModel.ByLineRef = dbArticle.ByLineRef;
                        articleModel.CategoryRef = dbArticle.CategoryRef;
                        articleModel.SubCategoryRef = dbArticle.SubCategoryRef;
                        articleModel.Contents = dbArticle.Content;
                        articleModel.Summary = dbArticle.Summary;
                        articleModel.Created = dbArticle.Created;
                        articleModel.Updated = dbArticle.LastUpdated;
                        articleModel.LastUpdated = dbArticle.LastUpdated.ToShortDateString();
                        articleModel.ImageName = dbArticle.ImageName;
                        //article.SortDate = dbArticle.LastUpdated.Value.ToString("yyyyMMdd");
                        foreach (ArticleTag tag in dbArticle.ArticleTags)
                        {
                            articleModel.Tags.Add(new DbArticleTagModel() { TagName = tag.TagName, Id = tag.Id, TagCategoryRef = tag.TagCategoryRef });
                        }
                        articleModel.Success = "ok";
                    }
                }
            }
            catch (Exception ex) { articleModel.Success = Helpers.ErrorDetails(ex); }
            return articleModel;
        }

        [HttpPost]
        public string Post(DbArticleModel articleModel)
        {
            var success = "";
            try
            {
                Article newArticle = new Article();
                if (articleModel.Id == null)
                    newArticle.Id = Guid.NewGuid().ToString();
                else
                    newArticle.Id = articleModel.Id;
                newArticle.Title = articleModel.Title;
                newArticle.CategoryRef = articleModel.CategoryRef;
                newArticle.SubCategoryRef = articleModel.SubCategoryRef;
                newArticle.ImageName = articleModel.ImageName;
                newArticle.Created = DateTime.Now;
                newArticle.LastUpdated = DateTime.Parse(articleModel.LastUpdated);
                newArticle.Content = articleModel.Contents;
                newArticle.Summary = articleModel.Summary;
                newArticle.ByLineRef = articleModel.ByLineRef;

                foreach (DbArticleTagModel tag in articleModel.Tags)
                    if (tag.TagName != null)
                        newArticle.ArticleTags.Add(new ArticleTag() { TagName = tag.TagName, TagCategoryRef = tag.TagCategoryRef });
                using (WebSiteContext db = new WebSiteContext())
                {
                    db.Articles.Add(newArticle);
                    db.SaveChanges();
                    success = newArticle.Id.ToString();
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
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
                    article.Title = editArticle.Title;
                    article.CategoryRef = editArticle.CategoryRef;
                    article.SubCategoryRef = editArticle.SubCategoryRef;
                    article.ImageName = editArticle.ImageName;
                    article.LastUpdated = DateTime.Parse(editArticle.LastUpdated);
                    article.ByLineRef = editArticle.ByLineRef;
                    article.Content = editArticle.Contents;
                    article.Summary = editArticle.Summary;

                    db.ArticleTags.RemoveRange(db.ArticleTags.Where(t => t.articleId.ToString() == editArticle.Id));
                    //article.ArticleTags = null;
                    foreach (DbArticleTagModel tagModel in editArticle.Tags)
                    {
                        article.ArticleTags.Add(new ArticleTag() { articleId = article.Id, Id = tagModel.Id, TagName = tagModel.TagName });
                    }

                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success =  Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [System.Web.Http.Cors.EnableCors("*", "*", "*")]
    public class DbArticleTagController : ApiController
    {
        [HttpPost]
        public string Post(DbArticleTagModel tag)
        {
            var success = "";
            try
            {
                var dbTag = new ArticleTag();
                dbTag.TagName = tag.TagName;
                dbTag.articleId = tag.ArticleId;
                using (WebSiteContext db = new WebSiteContext())
                {
                    db.ArticleTags.Add(dbTag);
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success =  Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [System.Web.Http.Cors.EnableCors("*", "*", "*")]
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

                    newComment.success = new Home.GodaddyEmailController().Post(new Home.Models.EmailMessageModel()
                    {
                        Subject = "Somebody Actually Made A comment",
                        Body = comment.UserName + " said: " + comment.CommentText
                    });
                }
            }
            catch (Exception ex)
            {
                newComment.success =  Helpers.ErrorDetails(ex);
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
                success =  Helpers.ErrorDetails(ex);
            }
            return success;
        }
    }
}
