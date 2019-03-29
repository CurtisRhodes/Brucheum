using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApi.Directory.Models
{
    public class FileModel
    {
        public string ImageId { get; set; }
        public string FileName { get; set; }
        public DateTime Created { get; set; }
        public long Length { get; set; }
        //public string FullName { get; set; }
        public string Extension { get; set; }
    }

    public class DirTreeModel
    {
        public DirTreeModel()
        {
            Files = new List<FileModel>();
            SubDirs = new List<DirTreeModel>();
        }
        public int CategoryId { get; set; }
        public string LinkId { get; set; }
        public int ParentId { get; set; }
        public string DirectoryName { get; set; }
        public DateTime Created { get; set; }
        public long Length { get; set; }
        public string Path { get; set; }
        public string DanniPath { get; set; }
        public string Parent { get; set; }
        public string FirstImage { get; set; }
        public List<FileModel> Files { get; set; }
        public List<DirTreeModel> SubDirs { get; set; }
    }

    public class ImageLinkModel
    {
        public int FolderId { get; set; }
        public int CopyToFolderId { get; set; }
        public string ImageId { get; set; }
        public string Link { get; set; }
        public string Path { get; set; }
    }

    public class ImageCategoryModel
    {
        public int Id { get; set; }
        public int Parent { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public int FileCount { get; set; }
    }


    public class GalleryItem
    {
        public int FolderId { get; set; }
        public string FolderName { get; set; }
    }

    public class MoveFolderModel
    {
        public int FolderToMoveId { get; set; }
        public int NewParentId { get; set; }
    }
    public class MoveImageModel
    {
        public int SourceFolderId { get; set; }
        public int DestinationFolderId { get; set; }
        public string ImageName { get; set; }
    }

    public class VideoLinkModel
    {
        public string Link { get; set; }
        public string Image { get; set; }
        public string Title { get; set; }
    }

    public class FolderImageViewModel
    {
        public string ImageId { get; set; }
        public string FolderName { get; set; }
        public string Link { get; set; }
        public string FolderPath { get; set; }
        public int FileCount { get; set; }
    }

    public class DownloadLink
    {
        public string LinkId { get; set; }
        public int FolderId { get; set; }
        public int ParentId { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public string GoDaddyLink { get; set; }
        public string ExternalLink { get; set; }
        //public string FileName { get; set; }
        //public string Link { get; set; }
    }
    public class CarouselItemModel
    {
        public int FolderId { get; set; }
        public int ParentId { get; set; }
        public string FolderName { get; set; }
        public string FolderPath { get; set; }
        public string RootFolder { get; set; }
        public string Link { get; set; }
    }

    public class CarouselInfoModel
    {
        public CarouselInfoModel() {
            Links = new List<CarouselItemModel>();
        }
        public List<CarouselItemModel> Links { get; set; }
        public int FolderCount { get; set; }
        public string Success { get; set; }
    }

    public class RepairReport
    {
        public RepairReport()
        {
            Errors = new List<string>();
        }
        public int ImagesRenamed { get; set; }
        public int LinksEdited { get; set; }
        public int NewLinksAdded { get; set; }
        public int LinksRemoved { get; set; }
        public string FolderName { get; set; }
        public string Success { get; set; }
        public List<string> Errors { get; set; }
        public string[] ErrorArray { get; set; }
    }

}