using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WebApi.Models;
using WebApi.DataContext;
using System.Web.Http.Cors;
using System.IO;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class ArticleController : ApiController
    {
        [HttpGet]
        public ArticlesModel GetArticleList(int pageLen, int page, string filterType, string filter)
        {
            var articleModel = new ArticlesModel();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    IList<VwArticle> dbArtiles = null;
                    switch (filterType)
                    {
                        case "Category":
                            dbArtiles = db.VwArticles.Where(a => a.Category == filter).OrderByDescending(a => a.LastUpdated).Skip(page - 1).Take(pageLen).ToList();
                            break;
                        case "Byline":
                            dbArtiles = db.VwArticles.Where(a => a.ByLine == filter).OrderByDescending(a => a.LastUpdated).Skip(page - 1).Take(pageLen).ToList();
                            break;
                        default:
                            dbArtiles = db.VwArticles.OrderByDescending(a => a.LastUpdated).Skip(page - 1).Take(pageLen).ToList();
                            break;
                    }
                    foreach (VwArticle vwArticle in dbArtiles)
                    {
                        articleModel.ArticleList.Add(new ArticleModel()
                        {
                            Title = vwArticle.Title,
                            Summary = vwArticle.Summary,
                            Contents = vwArticle.Content,
                            ByLine = vwArticle.ByLine,
                            ByLineRef = vwArticle.ByLineRef,
                            ImageName = vwArticle.ImageName,
                            Updated = vwArticle.LastUpdated.ToShortDateString(),
                            Created = vwArticle.Created,
                            LastUpdated = vwArticle.LastUpdated,
                            SubCategoryRef = vwArticle.SubCategoryRef,
                            SubCategory = vwArticle.SubCategory,
                            Category = vwArticle.Category,
                            CategoryRef = vwArticle.CategoryRef,
                            Id = vwArticle.Id
                        });
                    }
                    articleModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                articleModel.Success = Helpers.ErrorDetails(ex);
            }
            return articleModel;
        }

        [HttpGet]
        public ArticleModel GetSingleArticle(string articleId)
        {
            var articleModel = new ArticleModel();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    VwArticle dbArticle = db.VwArticles.Where(a => a.Id.ToString() == articleId).FirstOrDefault();
                    if (dbArticle != null)
                    {
                        articleModel.Title = dbArticle.Title;
                        articleModel.ByLine = dbArticle.ByLine;
                        articleModel.Category = dbArticle.Category;
                        articleModel.SubCategory = dbArticle.SubCategory;
                        articleModel.Contents = dbArticle.Content;
                        articleModel.Summary = dbArticle.Summary;
                        articleModel.Created = dbArticle.Created;
                        articleModel.LastUpdated = dbArticle.LastUpdated;
                        articleModel.Updated = dbArticle.LastUpdated.ToShortDateString();
                        articleModel.ImageName = dbArticle.ImageName;
                        //article.SortDate = dbArticle.LastUpdated.Value.ToString("yyyyMMdd");
                        //foreach (ArticleTag tag in dbArticle.ArticleTags)
                        //{
                        //    articleModel.Tags.Add(new DbArticleTagModel() { TagName = tag.TagName, Id = tag.Id, TagCategoryRef = tag.TagCategoryRef });
                        //}
                        articleModel.Success = "ok";
                    }
                }
            }
            catch (Exception ex) { articleModel.Success = Helpers.ErrorDetails(ex); }
            return articleModel;
        }

        [HttpPost]
        public string Post(ArticleModel articleModel)
        {
            string success = "";
            try
            {
                Article newArticle = new Article();
                //if (articleModel.Id == null)
                //    newArticle.Id = Guid.NewGuid().ToString();
                //else
                //    newArticle.Id = articleModel.Id;

                newArticle.Id = Guid.NewGuid().ToString();
                newArticle.Title = articleModel.Title;
                newArticle.CategoryRef = articleModel.CategoryRef;
                newArticle.SubCategoryRef = articleModel.SubCategoryRef;
                newArticle.ImageName = articleModel.ImageName;
                newArticle.Created = DateTime.Now;
                //newArticle.LastUpdated = DateTime.Parse(articleModel.LastUpdated);
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
        public string Put(ArticleModel editArticle)
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
                    article.LastUpdated = DateTime.Now;  //DateTime.Parse(editArticle.LastUpdated);
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
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
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
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
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

                    //newComment.success = new GodaddyEmailController().SendEmail("Somebody Actually Made A comment", comment.UserName + " said: " + comment.CommentText);
                }
            }
            catch (Exception ex)
            {
                newComment.success = Helpers.ErrorDetails(ex);
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
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class RefController : ApiController
    {
        [HttpGet]
        public RefModel Get(string refType)
        {
            var refs = new RefModel();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    IList<Ref> dbrefs = db.Refs.Where(r => r.RefType == refType).OrderBy(r => r.RefDescription).ToList();
                    foreach (Ref r in dbrefs)
                    {
                        refs.RefItems.Add(new RefItem()
                        {
                            RefCode = r.RefCode,
                            RefType = r.RefType,
                            RefDescription = r.RefDescription
                        });
                    }
                    refs.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                refs.Success = Helpers.ErrorDetails(ex);
            }
            return refs;
        }

        [HttpGet]
        public RefItem Get(string refCode, string refType)
        {
            var refItem = new RefItem();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    Ref dbref = db.Refs.Where(r => r.RefType == refType && r.RefCode == refCode).FirstOrDefault();
                    if (dbref == null)
                        refItem.Success = "ref not found";
                    else
                    {
                        refItem.RefCode = dbref.RefCode;
                        refItem.RefDescription = dbref.RefDescription;
                        refItem.Success = "ok";
                    }
                }
            }
            catch (Exception ex)
            {
                refItem.Success = Helpers.ErrorDetails(ex);
            }
            return refItem;
        }

        [HttpPost]
        public string Post(RefItem refItem)
        {
            string success = "";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    Ref @ref = new Ref();
                    @ref.RefType = refItem.RefType;
                    @ref.RefCode = GetUniqueRefCode(refItem.RefDescription, db);
                    @ref.RefDescription = refItem.RefDescription;

                    db.Refs.Add(@ref);
                    db.SaveChanges();

                    //refModel.RefCode = @ref.RefCode;
                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = ex.Message;
            }
            return success;
        }

        [HttpPut]
        public string Put(RefItem refItem)
        {
            string success = "";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    Ref @ref = db.Refs.Where(r => r.RefCode == refItem.RefCode).First();
                    @ref.RefDescription = refItem.RefDescription;
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = ex.Message; }
            return success;
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
    public class ImageController : ApiController
    {
        private readonly string imagesPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Images");

        [HttpPost]
        public LoadImageSuccessModel AddImage(string articleId, string imageFullFileName)
        {
            var imageModel = new LoadImageSuccessModel();
            try
            {
                string fullPathImageFileName = Path.Combine(imagesPath, imageFullFileName);
                Byte[] byteArray = Request.Content.ReadAsByteArrayAsync().Result;
                File.WriteAllBytes(fullPathImageFileName, byteArray);
                using (WebSiteContext db = new WebSiteContext())
                {
                    Article article = db.Articles.Where(a => a.Id == articleId).FirstOrDefault();
                    article.ImageName = imageFullFileName;
                    db.SaveChanges();
                }
                imageModel.Success = "ok";
            }
            catch (Exception ex)
            {
                imageModel.Success = Helpers.ErrorDetails(ex);
            }
            return imageModel;
        }
    }
}
