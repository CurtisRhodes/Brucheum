using OggleBooble.Api.MySqlDataContext;
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
            items = new List<BlogComment>();
        }
        public List<BlogComment> items { get; set; }
        public string Success { get; set; }
    }
}