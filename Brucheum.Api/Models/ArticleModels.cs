using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Bruchem.Api
{
    public class DbArticleTagModel
    {
        public int Id { get; set; }
        public string ArticleId { get; set; }
        public string TagName { get; set; }
        public string TagCategoryRef { get; set; }
    }

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
        public string Summary { get; set; }
        public string Contents { get; set; }
        public string Category { get; set; }
        public string SubCategory { get; set; }
        public string ByLine { get; set; }
        public string CategoryRef { get; set; }
        public string SubCategoryRef { get; set; }
        public string ByLineRef { get; set; }
        public string ImageName { get; set; }
        public string Updated { get; set; }
        public DateTime Created { get; set; }
        public DateTime LastUpdated { get; set; }
        public List<DbArticleTagModel> Tags { get; set; }
        public string Success { get; set; }
    }

    public class LoadImageSuccessModel {
        public string ImageFileName { get; set; }
        public string Success { get; set; }
    }

    public class RefModel
    {
        public RefModel()
        {
            RefItems = new List<RefModelItem>();
        }
        public List<RefModelItem> RefItems { get; set; }
        public string Success { get; set; }
    }
    public class RefModelItem
    {
        public string RefCode { get; set; }
        public string RefDescription { get; set; }
    }

    public class RefItem
    {
        public string RefType { get; set; }
        public string RefCode { get; set; }
        public string RefDescription { get; set; }
        public string Success { get; set; }
    }

    public class FacebookUserModel
    {
        public Guid UserId { get; set; }
        public string FacebookId { get; set; }
        public string FirstName { get; set; }
        public string MoreIfo { get; set; }
        public string success { get; set; }
    }

    // to join with user to get user Name
    public class CommentsModel
    {
        public string CommentTitle { get; set; }
        public string CommentText { get; set; }
        public int CommentId { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string ArticleId { get; set; }
        public string success { get; set; }
        public string CreateDate { get; set; }
    };
}


namespace Bruchem.Api.Xml.Models
{
    public class ArticelXmlModel
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Category { get; set; }
        public string SubCategory { get; set; }
        public string Summary { get; set; }
        public string ImageName { get; set; }
        public string Byline { get; set; }
        public string DateCreated { get; set; }
        public string LastUpdated { get; set; }
        public DateTime Created { get; set; }
        public DateTime Updated { get; set; }
        public string[] Tags { get; set; }
        public string Contents { get; set; }
        public string SortDate { get; set; }
        public string ArticleTypeDescription { get; set; }
    }

    public class XmlBookModel
    {
        public string BookTitle { get; set; }
        public string ChapterId { get; set; }
        public string ChapterTitle { get; set; }
        public string ChapterOrder { get; set; }
        public string SectionId { get; set; }
        public string SectionTitle { get; set; }
        public string SubSectionId { get; set; }
        public string SubSectionTitle { get; set; }
        public string Contents { get; set; }
        public string DateCreated { get; set; }
        public string LastUpdated { get; set; }
        public string success { get; set; }
    }
}
