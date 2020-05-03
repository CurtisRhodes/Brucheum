using OggleBooble.Api.MsSqlDataContext;
using OggleBooble.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace OggleBooble.Api.Controllers
{
    public class BlogController : ApiController
    {
        [HttpGet]
        public BlogCommentModel Get(int blogId)
        {
            BlogCommentModel entry = new BlogCommentModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
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
        public BlogCommentModelContainer GetBlogList(string commentType)
        {
            BlogCommentModelContainer blogCommentsContainer = new BlogCommentModelContainer();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
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

        [HttpPatch]
        public BlogCommentModel GetImageComment(string linkId, string userId)
        {
            BlogCommentModel entry = new BlogCommentModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    BlogComment dbBlogComment = db.BlogComments.Where(b => b.LinkId == linkId).Where(b => b.UserId == userId).FirstOrDefault();
                    if (dbBlogComment != null)
                    {
                        entry.CommentTitle = dbBlogComment.CommentTitle;
                        entry.CommentText = dbBlogComment.CommentText;
                        entry.Id = dbBlogComment.Id;
                    }
                    else
                        entry.Id = 0;
                }
                entry.Success = "ok";
            }
            catch (Exception ex)
            {
                entry.CommentTitle = Helpers.ErrorDetails(ex);
            }
            return entry;
        }

        [HttpPost]
        public SuccessModel Insert(BlogComment entry)
        {
            SuccessModel success = new SuccessModel();
            try
            {
                entry.Posted = DateTime.Now;
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    db.BlogComments.Add(entry);
                    db.SaveChanges();
                    success.Success = "ok";
                    success.ReturnValue = entry.Id.ToString();
                }
            }
            catch (Exception e)
            {
                success.Success = Helpers.ErrorDetails(e);
            }
            return success;
        }

        [HttpPut]
        public string Update(BlogComment entry)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
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
