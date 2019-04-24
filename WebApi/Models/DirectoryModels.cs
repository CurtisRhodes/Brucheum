using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using WebApi.OggleBooble.DataContext;

namespace WebApi.Directory.Models
{
    public class CategoryTreeModel
    {
        public CategoryTreeModel()
        {
            SubDirs = new List<CategoryTreeModel>();
        }
        public int CategoryId { get; set; }
        public int ParentId { get; set; }
        public long Length { get; set; }
        public string DirectoryName { get; set; }
        public string DanniPath { get; set; }
        public string FirstImage { get; set; }
        public string LinkId { get; set; }
        public List<CategoryTreeModel> SubDirs { get; set; }
    }
    public class CategoryImageLinkModel
    {
        public int ImageCategoryId { get; set; }
        public string ImageLinkId { get; set; }
        public string FolderName { get; set; }
    }

    public class CategoryImageModel
    {
        public CategoryImageModel()
        {
            Files = new List<VwLink>();
            SubDirs = new List<CategoryTreeModel>();
        }
        public string LinkId { get; set; }
        public long Length { get; set; }
        public string RootFolder { get; set; }
        public List<VwLink> Files { get; set; }
        public List<CategoryTreeModel> SubDirs { get; set; }
        public string Success { get; set; }
    }


    public class CategoryFolderModel
    {
        public int Id { get; set; }
        public int Parent { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public int FileCount { get; set; }
        public string CategoryText { get; set; }
    }

    public class GalleryItem
    {
        public int FolderId { get; set; }
        public string FolderName { get; set; }
    }

    public class AddLinkModel
    {
        public int FolderId { get; set; }
        public string Link { get; set; }
        public string Path { get; set; }
    }
    public class DeleteLinkModel
    {
        public int FolderId { get; set; }
        public string ImageId { get; set; }
    }
    public class CopyLinkModel
    {
        public int CopyToFolderId { get; set; }
        public string ImageId { get; set; }
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
        public string GoDaddyLink { get; set; }
    }

    public class MetaTagInfo
    {
        public MetaTagInfo()
        {
            MetaTags = new List<MetaTagModel>();
        }
        public List<MetaTagModel> MetaTags { get; set; }
        public string FolderName { get; set; }
        public string Success { get; set; }

    }
    public class MetaTagModel
    {
        public int TagId { get; set; }
        public int FolderId { get; set; }
        public string TagType { get; set; }
        public string TagValue { get; set; }
    }

    public class VideoLinkModel
    {
        public string Link { get; set; }
        public string Image { get; set; }
        public string Title { get; set; }
    }

    public class RepairLinkModel
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
        public string ModelName { get; set; }
        public string FolderPath { get; set; }
        public string RootFolder { get; set; }
        public string Link { get; set; }
        public string LinkId { get; set; }
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

    public class FtpFolder
    {
        public DateTime modified { get; set; }
        public string Name { get; set; }
        public long size { get; set; }

    }
    public class FtpFileInfo
    {
        public string Name { get; set; }
        public string Permissions { get; set; }
        public string Path { get; set; }

    }

    public class xxBlogCommentModel {
        public int Id { get; set; }
        public string CommentTitle { get; set; }
        public string CommentType { get; set; }
        public string Link { get; set; }
        public string LinkId { get; set; }
        public string FolderId { get; set; }
        public string UserId { get; set; }
        public string CommentText { get; set; }
        public DateTime Posted { get; set; }
    }

    public class RepairReportModel
    {
        public RepairReportModel()
        {
            Errors = new List<string>();
            //MissingImages = new List<FileInfo>();
            //BadLinks = new List<GoDaddyLink>();
        }
        public int ImagesRenamed { get; set; }
        public int LinksEdited { get; set; }
        public int NewLinksAdded { get; set; }
        public int LinksRemoved { get; set; }
        public int ImagesDownLoaded  { get; set; }
        public int DirNotFound { get; set; }
        public int CatLinksAdded { get; set; }
        public int RowsProcessed { get; set; }
        public int ImagesMoved { get; set; }
        public int BadFileNames { get; set; }
        public int BadLinks { get; set; }
        public bool isSubFolder { get; set; }

        public List<string> Errors { get; set; }
        //public List<FileInfo> MissingImages { get; set; }
        //public List<GoDaddyLink> BadLinks { get; set; }
        //public string[] ErrorsArray { get; set; }
        //public string[] MissingImagesArray { get; set; }
        //public string[] BadLinksArray { get; set; }
        public string Success { get; set; }
    }

    public class NudeModelImageModel {
        public int ModelId { get; set; }
        public string LinkId { get; set; }

    }
    public class NudeModelInfoModel
    {
        public int ModelId { get; set; }
        public string ModelName { get; set; }
        public string Nationality { get; set; }
        public string ExternalLinks { get; set; }
        public string CommentText { get; set; }
        public int FolderId { get; set; }
        public string RootFolder { get; set; }
        public string Born { get; set; }
        public string LinkId { get; set; }
        public string Success { get; set; }
    }
}