namespace WebApi.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("website.ImageFile")]
    public partial class ImageFile
    {
        [Key]
        public Guid ImageId { get; set; }

        [Required]
        [StringLength(200)]
        public string ImageName { get; set; }

        public int? FolderId { get; set; }

        [Required]
        [StringLength(100)]
        public string FolderName { get; set; }

        public long? Size { get; set; }

        public int VotesUp { get; set; }

        public int VotesDown { get; set; }

        public virtual ImageFolder ImageFolder { get; set; }
    }
}
