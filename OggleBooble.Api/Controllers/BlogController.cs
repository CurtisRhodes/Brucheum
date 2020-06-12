using OggleBooble.Api.MsSqlDataContext;
using OggleBooble.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class OggleJournalController : ApiController
    {
        [HttpGet]
        [Route("api/OggleJournal/GetBlogItem")]
        public BlogCommentModel GetBlogItem(int blogId)
        {
            BlogCommentModel entry = new BlogCommentModel();
            try
            {
                using (var db = new OggleBoobleMSSqlContext())
                {
                    BlogComment dbBlogComment = db.BlogComments.Where(b => b.Id == blogId).FirstOrDefault();
                    if (dbBlogComment != null)
                    {
                        entry.CommentTitle = dbBlogComment.CommentTitle;
                        entry.CommentText = dbBlogComment.CommentText;
                        entry.CommentType = dbBlogComment.CommentType;
                        entry.Link = dbBlogComment.Link;
                        entry.Id = dbBlogComment.Id;
                        entry.Success = "ok";
                    }
                    else
                        entry.Success = "blogId " + blogId + " not found";
                }
            }
            catch (Exception ex)
            {
                entry.Success = Helpers.ErrorDetails(ex);
            }
            return entry;
        }

        [HttpGet]
        [Route("api/OggleJournal/GetBlogList")]
        public BlogCommentModelContainer GetBlogList(string commentType)
        {
            BlogCommentModelContainer blogCommentsContainer = new BlogCommentModelContainer();
            try
            {
                using (var db = new OggleBoobleMSSqlContext())
                {
                    List<BlogComment> dbBlogCommentsContainer = db.BlogComments.Where(b => b.CommentType == commentType).ToList();
                    foreach (BlogComment dbBlogComment in dbBlogCommentsContainer)
                    {
                        blogCommentsContainer.blogComments.Add(new BlogCommentModel()
                        {
                            Id = dbBlogComment.Id,
                            CommentTitle = dbBlogComment.CommentTitle,
                            CommentText = dbBlogComment.CommentText,
                            Link = dbBlogComment.Link
                        });
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
        public BlogCommentModel GetBlogComment(string linkId, string userId)
        {
            var blogComment = new BlogCommentModel();
            try
            {
                using (var db = new OggleBoobleMSSqlContext())
                {
                    BlogComment dbBlogComment = db.BlogComments.Where(b => b.LinkId == linkId).Where(b => b.UserId == userId).FirstOrDefault();
                    if (dbBlogComment != null)
                    {
                        //public class BlogCommentModel
                        //{
                        //    public int Id { get; set; }
                        //    public string CommentTitle { get; set; }
                        //    public string CommentType { get; set; }
                        //    public string Link { get; set; }
                        //    public string LinkId { get; set; }
                        //    public int FolderId { get; set; }
                        //    public string UserId { get; set; }
                        //    public string CommentText { get; set; }
                        //    public string Posted { get; set; }
                        //    public string Success { get; set; }
                        //}
                        blogComment.CommentTitle = dbBlogComment.CommentTitle;
                        blogComment.CommentText = dbBlogComment.CommentText;
                        blogComment.Id = dbBlogComment.Id;
                    }
                    else
                        blogComment.Id = 0;
                }
                blogComment.Success = "ok";
            }
            catch (Exception ex)
            {
                blogComment.CommentTitle = Helpers.ErrorDetails(ex);
            }
            return blogComment;
        }

        [HttpPost]
        [Route("api/OggleJournal/Insert")]
        public SuccessModel Insert(BlogComment blogComment)
        {
            SuccessModel successModel = new SuccessModel();
            try
            {
                blogComment.Posted = DateTime.Now;
                using (var db = new OggleBoobleMSSqlContext())
                {
                    db.BlogComments.Add(blogComment);
                    db.SaveChanges();
                    successModel.Success = "ok";
                    successModel.ReturnValue = blogComment.Id.ToString();
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
                using (var db = new OggleBoobleMSSqlContext())
                {
                    var dbEntry = db.BlogComments.Where(b => b.Id == entry.Id).FirstOrDefault();
                    if (dbEntry == null)
                        return "Entry not found";

                    dbEntry.CommentTitle = entry.CommentTitle;
                    dbEntry.CommentText = entry.CommentText;
                    dbEntry.CommentType = entry.CommentType;
                    dbEntry.Link = entry.Link;
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
