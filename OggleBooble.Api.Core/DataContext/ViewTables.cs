using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OggleBooble.Api.Core
{
    [Table("VwDirTree")]
    public partial class VwDirTree
    {
        [Key]
        [Column(Order = 0)]
        public int Id { get; set; }
        [Key]
        [Column(Order = 1)]
        public int Parent { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public string FolderType { get; set; }
        public string FolderImage { get; set; }
        public int FileCount { get; set; }
        public int TotalChildFiles { get; set; }
        public int SubFolderCount { get; set; }
        public int SortOrder { get; set; }
        public int IsStepChild { get; set; }
    }

    [Table("VwCarouselImages")]
    public class VwCarouselItem
    {
        [Key]
        public string LinkId { get; set; }
        public int FolderId { get; set; }
        public string RootFolder { get; set; }
        public string RealRoot { get; set; }
        public string FolderType { get; set; }
        public string FolderName { get; set; }
        public string FolderParentName { get; set; }
        public int FolderParentId { get; set; }
        public string FolderGPName { get; set; }
        public string PlayboyYear { get; set; }
        public int FolderGPId { get; set; }
        public int ImageFolderId { get; set; }
        public string ImageFolderName { get; set; }
        public string ImageFolderParentName { get; set; }
        public int ImageFolderParentId { get; set; }
        public string ImageFolderGPName { get; set; }
        public int ImageFolderGPId { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public string ImageFileName { get; set; }
    }

    [Table("VwSlideshowItems")]
    public class VwSlideshowItem
    {
        [Key]
        public string LinkId { get; set; }
        public int FolderId { get; set; }
        public int Parent { get; set; }
        public int ImageFolderId { get; set; }
        public string ImageFolderName { get; set; }
        public string ChildFolderName { get; set; }
        public string FolderName { get; set; }
        public string FileName { get; set; }
        public int SortOrder { get; set; }
    }

}
