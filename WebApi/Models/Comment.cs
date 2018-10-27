namespace WebApi.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("website.Comment")]
    public partial class Comment
    {
        public Guid CommentId { get; set; }

        public Guid? UserId { get; set; }

        public Guid ArticleId { get; set; }

        public DateTime CreateDate { get; set; }

        [StringLength(500)]
        public string CommentTitle { get; set; }

        [Column(TypeName = "ntext")]
        [Required]
        public string CommentText { get; set; }
    }
}
