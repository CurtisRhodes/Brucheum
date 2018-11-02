using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net.Http;
using System.Web;

namespace Brucheum
{
    public class RoleModel
    {
        public string Id { get; set; }
        public string Name { get; set; }
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
    }

    public class BookModel
    {
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

    public class VisitorModel
    {
        public string IPAddress { get; set; }
        public string SomethingNice { get; set; }
        public string MoreIfo { get; set; }
        public string Success { get; set; }
    }

    public class RegisterValidationModel
    {
        [Required]
        [Display(Name = "Go By Name")]
        public string UserName { get; set; }

        //[Required]
        //[EmailAddress]
        //[Display(Name = "Email")]
        public string Email { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Confirm password")]
        [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; }

        [Display(Name = "Hometown")]
        public string Hometown { get; set; }
        public string IPAddress { get; set; }

        public bool RememberMe { get; set; }
    }

    public class LoginModel
    {
        public string Password { get; set; }
        public bool RememberMe { get; set; }
        public Guid UserId { get; set; }
        public string IPAddress { get; set; }
        public string Email { get; set; }
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public short? Pin { get; set; }
        public string FaceBookId { get; set; }
        public DateTime? CreateDate { get; set; }
        public DateTime? LastModified { get; set; }
        public string success { get; set; }
    }

    public class FacebooUserrModel
    {
        public string FacebookId { get; set; }
        public string FirstName { get; set; }
        public string MoreIfo { get; set; }
        public string Success { get; set; }
    }
}