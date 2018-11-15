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
    public class DbArticelModel
    {
        public int ArticleId { get; set; }
        public string ArticleTitle { get; set; }
        public string ArticleType { get; set; }
        public string ArticleText { get; set; }
        public DateTime CreateDate { get; set; }
    }
    public class SectionModel
    {
        public int Id { get; set; }
        public string SectionName { get; set; }
        public string SectionTitle { get; set; }
        public string SectionContents { get; set; }
    }
    public class SkillModel
    {
        public string Id { get; set; }
        public string SkillName { get; set; }
        public string SkillCategory { get; set; }
    }

    public class LostJobModel
    {
        public string Id { get; set; }
        public string JobTitle { get; set; }
        public string Employer { get; set; }
        public string JobLocation { get; set; }
        public string StartMonth { get; set; }
        public string StartYear { get; set; }
        public string FiredMonth { get; set; }
        public string FiredYear { get; set; }
        public string Summary { get; set; }
        public string ReasonForLeaving { get; set; }
        public string SecretNarative { get; set; }
    }

    public class ArticleModel
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Category { get; set; }
        public string Summary { get; set; }
        public string ImageName { get; set; }
        public string Byline { get; set; }
        public string DateCreated { get; set; }
        public string LastUpdated { get; set; }
        public string[] Tags { get; set; }
        public string Contents { get; set; }
        public string SortDate { get; set; }
    }

    public class BookModel
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
