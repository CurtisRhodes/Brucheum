using OggleBooble.Api.MSSqlDataContext;
using OggleBooble.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using OggleBooble.Api.MySqlDataContext;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class OggleJournalController : ApiController
    {
        [HttpGet]
        [Route("api/OggleJournal/GetBlogItem")]
        public BlogCommentModelContainer GetBlogItem(string blogId)
        {
            BlogCommentModelContainer blogCommentsContainer = new BlogCommentModelContainer();
            try
            {
                //using (var db = new OggleBoobleMSSqlContext())
                using (var db = new OggleBoobleMySqlContext())
                {
                    BlogComment dbBlogComment = db.BlogComments.Where(b => b.Id == blogId).FirstOrDefault();
                    if (dbBlogComment != null)
                    {
                        blogCommentsContainer.items.Add(new BlogComment()
                        {
                            Id = dbBlogComment.Id,
                            CommentTitle = dbBlogComment.CommentTitle,
                            CommentText = dbBlogComment.CommentText,
                            CommentType = dbBlogComment.CommentType,
                            ImageLink = dbBlogComment.ImageLink
                        });
                        blogCommentsContainer.Success = "ok";
                    }
                    else
                        blogCommentsContainer.Success = "blogId " + blogId + " not found";
                }
            }
            catch (Exception ex)
            {
                blogCommentsContainer.Success = Helpers.ErrorDetails(ex);
            }
            return blogCommentsContainer;
        }

        [HttpGet]
        [Route("api/OggleJournal/GetBlogList")]
        public BlogCommentModelContainer GetBlogList(string commentType)
        {
            BlogCommentModelContainer blogCommentsContainer = new BlogCommentModelContainer();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    List<BlogComment> dbBlogComments = db.BlogComments.Where(b => b.CommentType == commentType).ToList();
                    foreach (BlogComment dbBlogComment in dbBlogComments)
                    {
                        blogCommentsContainer.items.Add(dbBlogComment);
                    }
                    blogCommentsContainer.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                blogCommentsContainer.Success = Helpers.ErrorDetails(ex);
            }
            return blogCommentsContainer;
        }

        [HttpGet]
        [Route("api/OggleBlog/GetBlogComment")]
        public BlogCommentModelContainer GetBlogComment(string linkId, string visitorId)
        {
            var blogCommentModelContainer = new BlogCommentModelContainer();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    BlogComment dbBlogComment = db.BlogComments.Where(b => b.Id == linkId).FirstOrDefault();
                    if (dbBlogComment == null)
                        blogCommentModelContainer.Success = "Id not found";
                    else
                    blogCommentModelContainer.items.Add(dbBlogComment);
                }
                blogCommentModelContainer.Success = "ok";
            }
            catch (Exception ex)
            {
                blogCommentModelContainer.Success = Helpers.ErrorDetails(ex);
            }
            return blogCommentModelContainer;
        }

        [HttpPost]
        [Route("api/OggleJournal/Insert")]
        public SuccessModel Insert(BlogComment blogComment)
        {
            SuccessModel successModel = new SuccessModel();
            try
            {
                blogComment.Posted = DateTime.Now;
                using (var db = new OggleBoobleMySqlContext())
                {
                    blogComment.Id = Guid.NewGuid().ToString();
                    db.BlogComments.Add(blogComment);
                    db.SaveChanges();
                    successModel.Success = "ok";
                    successModel.ReturnValue = blogComment.Id;
                }
            }
            catch (Exception e)
            {
                successModel.Success = Helpers.ErrorDetails(e);
            }
            return successModel;
        }

        [HttpPut]
        [Route("api/OggleJournal/Update")]
        public string Update(BlogComment entry)
        {
            string success = "";
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbEntry = db.BlogComments.Where(b => b.Id == entry.Id).FirstOrDefault();
                    if (dbEntry == null)
                        return "Entry not found";

                    dbEntry.CommentTitle = entry.CommentTitle;
                    dbEntry.CommentText = entry.CommentText;
                    dbEntry.CommentType = entry.CommentType;
                    dbEntry.ImageLink = entry.ImageLink;
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception e)
            {
                success = Helpers.ErrorDetails(e);
            }
            return success;
        }
    }
}
