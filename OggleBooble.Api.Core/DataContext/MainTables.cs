using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OggleBooble.Api.Core
{
    [Table("CategoryFolder")]
    public partial class CategoryFolder
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int Parent { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public string FolderPath { get; set; }
        public string FolderType { get; set; }
        public string FolderImage { get; set; }
        public int Files { get; set; }
        public int SubFolders { get; set; }
        public int TotalChildFiles { get; set; }
        public int TotalSubFolders { get; set; }
        public int SortOrder { get; set; }
    }

    [Table("ImageFile")]
    public class ImageFile
    {
        [Key]
        public string Id { get; set; }
        public string FileName { get; set; }
        public int FolderId { get; set; }
        public string ExternalLink { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public long Size { get; set; }
        public DateTime Acquired { get; set; }
    }

    [Table("CategoryImageLink")]
    public partial class CategoryImageLink
    {
        [Key]
        public int ImageCategoryId { get; set; }
        public string ImageLinkId { get; set; }
        public int SortOrder { get; set; }
    }
}
