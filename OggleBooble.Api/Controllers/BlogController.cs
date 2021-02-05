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
    public class OggleBlogController : ApiController
    {
        [HttpGet]
        [Route("api/OggleBlog/GetBlogItem")]
        public SingleBlogCommentModel GetBlogItem(string blogId)
        {
            var singleBlogComment = new SingleBlogCommentModel();
            try
            {
                //using (var db = new OggleBoobleMSSqlContext())
                using (var db = new OggleBoobleMySqlContext())
                {
                    VwBlogComment vwBlogComment = db.VwBlogComments.Where(b => b.PkId == blogId).FirstOrDefault();
                    if (vwBlogComment != null)
                    {
                        singleBlogComment.CommentTitle = vwBlogComment.CommentTitle;
                        singleBlogComment.CommentText = vwBlogComment.CommentText;
                        singleBlogComment.ImageLink = vwBlogComment.ImageLink;
                        singleBlogComment.ImgSrc = vwBlogComment.ImgSrc;
                        singleBlogComment.CommentType = vwBlogComment.CommentType;
                        singleBlogComment.Pdate = vwBlogComment.Pdate;
                        singleBlogComment.Success = "ok";
                    }
                    else
                        singleBlogComment.Success = "blog entry not found";
                }
            }
            catch (Exception ex)
            {
                singleBlogComment.Success = Helpers.ErrorDetails(ex);
            }
            return singleBlogComment;
        }

        [HttpGet]
        [Route("api/OggleBlog/GetBlogList")]
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

        [HttpGet]
        [Route("api/OggleBlog/GetImageLink")]
        public string GetImageLink(string linkId)
        {
            string imageAddress;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    ImageFile dbImageFile = db.ImageFiles.Where(i => i.Id == linkId).First();
                    imageAddress = db.CategoryFolders.Where(f => f.Id == dbImageFile.FolderId).First().FolderPath + "/" + dbImageFile.FileName;
                }
            }
            catch (Exception ex)
            {
                imageAddress = Helpers.ErrorDetails(ex);
            }
            return imageAddress;
        }

        [HttpPost]
        [Route("api/OggleBlog/Insert")]
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
        [Route("api/OggleBlog/Update")]
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
