using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApi.Models
{
    public class RoleModel
    {
        public string Name { get; set; }
        public string Id { get; set; }
        public string Success { get; set; }
    }
    public class UserModel
    {
        public string Name { get; set; }
        public string Id { get; set; }
        public string Success { get; set; }
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

    public class UserLoginResponse
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        //public string Email { get; set; }
        //public string PasswordHash { get; set; }
        //public string FirstName { get; set; }
        //public string LastName { get; set; }
        //public string PhoneNumber { get; set; }
        //public short? Pin { get; set; }
        //public string FaceBookId { get; set; }
        //public DateTime? CreateDate { get; set; }
        //public DateTime? LastModified { get; set; }
        public string success { get; set; }
    }

    public class RefModel
    {
        public string RefType { get; set; }
        public string RefCode { get; set; }
        public string RefDescription { get; set; }
        public string Success { get; set; }
    }

    public class VisitorModel
    {
        public string IPAddress { get; set; }
        public string SomethingNice { get; set; }
        public string MoreIfo { get; set; }
        public string success { get; set; }
    }

    public class FacebookUserModel
    {
        public Guid UserId { get; set; }
        public string FacebookId { get; set; }
        public string FirstName { get; set; }
        public string MoreIfo { get; set; }
        public string success { get; set; }
    }

    public class CommentsModel
    {
        public string UserName { get; set; }
        public DateTime CreateDate { get; set; }
        public string CommentTitle { get; set; }
        public string CommentText { get; set; }
        public string Success { get; set; }
    };

}

    //[Serializable]
    //public class BookSchema
    //{
    //    public string Book { get; set; }
    //    public string Chapter { get; set; }
    //    public string Section { get; set; }
    //    public string SubSection { get; set; }
    //}


