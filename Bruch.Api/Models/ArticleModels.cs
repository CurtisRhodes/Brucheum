using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Bruch.Api.Models
{
    public class ArticlesModel
    {
        public ArticlesModel()
        {
            ArticleList = new List<ArticleModel>();
        }
        public List<ArticleModel> ArticleList { get; set; }
        public string Success { get; set; }
    }

    public class ArticleModel
    {
        public ArticleModel()
        {
            Tags = new List<DbArticleTagModel>();
        }
        public string Id { get; set; }
        public string Title { get; set; }
        public string CategoryLabel { get; set; }
        public string SubCategoryLabel { get; set; }
        public string ByLineLabel { get; set; }
        public string CategoryRef { get; set; }
        public string SubCategoryRef { get; set; }
        public string ByLineRef { get; set; }
        public string Summary { get; set; }
        public string ImageName { get; set; }
        public string LastUpdated { get; set; }
        public DateTime Created { get; set; }
        public DateTime Updated { get; set; }
        public List<DbArticleTagModel> Tags { get; set; }
        public string Contents { get; set; }
        public string Success { get; set; }
    }

    public class DbArticleTagModel
    {
        public int Id { get; set; }
        public string ArticleId { get; set; }
        public string TagName { get; set; }
        public string TagCategoryRef { get; set; }
    }
}