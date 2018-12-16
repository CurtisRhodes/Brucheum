using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApi.Models
{
    public class KeyValuePair
    {
        public string Key { get; set; }
        public string Value { get; set; }
    }

    public class DbArticleTagModel {
        public int Id { get; set; }
        public string ArticleId { get; set; }
        public string TagName { get; set; }
        public string TagCategoryRef { get; set; }
    }

    public class DbArticleModel
    {
        public DbArticleModel() {
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

    public class BlogModel
    {
        public BlogModel() {
            Entries = new List<BlogEntryModel>();
        }
        public string Id { get; set; }
        public string Name { get; set; }
        public string Owner { get; set; }
        public List<BlogEntryModel> Entries { get; set; }
    }

    public class BlogEntryModel
    {
        public string Id { get; set; }
        public string BlogId { get; set; }
        public string Title { get; set; }
        public string ImageName { get; set; }
        public string Created { get; set; }
        public string LastUpdated { get; set; }
        public string Contents { get; set; }
        public string Summary { get; set; }
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

    public class RefModel
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
