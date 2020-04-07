using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OggleBooble.Api.Models
{
    public class BlogCommentModelContainer
    {
        public BlogCommentModelContainer()
        {
            blogComments = new List<BlogCommentModel>();
        }
        public List<BlogCommentModel> blogComments { get; set; }
        public string LinkC { get; set; }
        public string Success { get; set; }
    }

    public class BlogCommentModel
    {
        public int Id { get; set; }
        public string CommentTitle { get; set; }
        public string CommentType { get; set; }
        public string Link { get; set; }
        public string LinkId { get; set; }
        public int FolderId { get; set; }
        public string UserId { get; set; }
        public string CommentText { get; set; }
        public string Posted { get; set; }
        public string Success { get; set; }
    }
}