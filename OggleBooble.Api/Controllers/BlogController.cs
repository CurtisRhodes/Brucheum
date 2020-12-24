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
        public BlogCommentSuccessModel GetBlogItem(string blogId)
        {
            var blogCommentModel = new BlogCommentSuccessModel();
            try
            {
                //using (var db = new OggleBoobleMSSqlContext())
                using (var db = new OggleBoobleMySqlContext())
                {
                    VwBlogComment vwBlogComment = db.VwBlogComments.Where(b => b.PkId == blogId).FirstOrDefault();
                    if (vwBlogComment != null)
                    {
                        blogCommentModel.BlogComments.Add(vwBlogComment);
                        blogCommentModel.Success = "ok";
                    }
                    else
                        blogCommentModel.Success = "blog entry not found";
                }
            }
            catch (Exception ex)
            {
                blogCommentModel.Success = Helpers.ErrorDetails(ex);
            }
            return blogCommentModel;
        }

        [HttpGet]
        [Route("api/OggleJournal/GetBlogList")]
        public BlogCommentSuccessModel GetBlogList(string commentType)
        {
            var blogCommentsModel = new BlogCommentSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    blogCommentsModel.BlogComments = db.VwBlogComments.Where(b => b.CommentType == commentType).ToList();
                    blogCommentsModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                blogCommentsModel.Success = Helpers.ErrorDetails(ex);
            }
            return blogCommentsModel;
        }

        // [Route("api/OggleBlog/GetBlogComment")]

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
