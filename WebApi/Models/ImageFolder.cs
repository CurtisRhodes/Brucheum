namespace WebApi.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("website.ImageFolder")]
    public partial class ImageFolder
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public ImageFolder()
        {
            ImageFiles = new HashSet<ImageFile>();
        }

        [Key]
        public int FolderId { get; set; }

        public int? ParentFolderId { get; set; }

        [Required]
        [StringLength(100)]
        public string FolderName { get; set; }

        [Required]
        [StringLength(300)]
        public string RelativePath { get; set; }

        public int? Files { get; set; }

        public long? Size { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<ImageFile> ImageFiles { get; set; }
    }
}
