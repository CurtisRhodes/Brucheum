using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Service1.Controllers
{
    [EnableCors("*", "*", "*")]
    public class CommentsController : ApiController
    {
        // GET: api/Comments
        public IQueryable<CommentsModel> Get(Guid articleId)
        {
            IQueryable<CommentsModel> results = Enumerable.Empty<CommentsModel>().AsQueryable();
            try
            {
                //string ARTICLEID = articleId.ToString().ToUpper();
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    results = (from comments in db.Comments
                               join users in db.UserLogins on comments.UserId equals users.UserId
                               where comments.ArticleId.ToString() == articleId.ToString().ToUpper()
                               orderby comments.CreateDate ascending
                               select new CommentsModel
                               {
                                   UserName = users.UserName,
                                   CreateDate = comments.CreateDate,
                                   CommentTitle = comments.CommentTitle,
                                   CommentText = comments.CommentText
                               }).ToList().AsQueryable();
                }

            }
            catch (Exception ex)
            {
                results = results.Concat(new[] { new CommentsModel() { Success = ex.Message } });
            }
            return results;
        }

        [HttpPost]
        public string Post(Comment newComment)
        {
            string success = "ERROR: oh no";
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    newComment.CreateDate = DateTime.Now;
                    newComment.CommentId = Guid.NewGuid();
                    db.Comments.Add(newComment);
                    db.SaveChanges();
                    success = newComment.CommentId.ToString();
                }
            }
            catch (Exception ex)
            {
                success = "ERROR: " + ex.Message;
            }
            return success;
        }

        [HttpPut]
        public string Put(Comment updateComment)
        {
            string success = "oh no";
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    Comment comment = db.Comments.Where(c => c.CommentId == updateComment.CommentId).First();
                    comment.CommentText = updateComment.CommentText;
                    comment.CommentTitle = updateComment.CommentTitle;

                    db.SaveChanges();
                    success = comment.CommentId.ToString();
                }
            }
            catch (Exception ex)
            {
                success = "ERROR: " + ex.Message;
            }
            return success;
        }
    }
}
