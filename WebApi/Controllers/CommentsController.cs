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
        public IEnumerable<Comment> Get(Guid articleId)
        {
            using (GoDaddyContext db = new GoDaddyContext())
            {
               return db.Comments.Where(c => c.ArticleId == articleId).ToArray();
            }
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
                    //newComment.CommentId = Guid.NewGuid();
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
