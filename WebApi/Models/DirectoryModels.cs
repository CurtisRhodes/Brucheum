using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using WebApi.DataContext;

namespace WebApi.Models
{
    public class SuccessModel
    {
        public string ReturnValue { get; set; }
        public string Success { get; set; }
    }

    public class ImageLinksModel
    {
        public ImageLinksModel()
        {
            Files = new List<VwLink>();
            SubDirs = new List<CategoryTreeModel>();
        }
        public int FoldrerId { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public List<VwLink> Files { get; set; }
        public List<CategoryTreeModel> SubDirs { get; set; }
        public string Success { get; set; }
    }

    public class CategoryTreeModel
    {
        public CategoryTreeModel()
        {
            SubDirs = new List<CategoryTreeModel>();
        }
        public int FolderId { get; set; }
        public int ParentId { get; set; }
        public string DirectoryName { get; set; }
        public string DanniPath { get; set; }
        public string RootFolder { get; set; }
        public string Link { get; set; }
        public string LinkId { get; set; }
        public int FileCount { get; set; }
        public int SubDirCount { get; set; }
        public int ChildFiles { get; set; }
        public int Links { get; set; }
        public int IsStepChild { get; set; }
        public List<CategoryTreeModel> SubDirs { get; set; }
    }

    public class BreadCrumbModel {
        public BreadCrumbModel()
        {
            BreadCrumbs = new List<BreadCrumbItemModel>();
        }        
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public string Html { get; set; }
        public List<BreadCrumbItemModel> BreadCrumbs { get; set; }
        public string Success { get; set; }
    }

    public class BreadCrumbItemModel
    {
        public int FolderId { get; set; }
        public string FolderName { get; set; }
        public int ParentId { get; set; }
        public bool IsInitialFolder { get; set; }
    }

    public class CategoryCommentContainer
    {
        public CategoryCommentContainer()
        {
            CategoryComments = new List<CategoryCommentModel>(); 
        }
        public List<CategoryCommentModel> CategoryComments { get; set; }
        public string Success { get; set; }
    }

    public class CategoryCommentModel
    {
        public int FolderId { get; set; }
        public string FolderName { get; set; }
        public string CommentText { get; set; }
        public string Link { get; set; }
        public string Success { get; set; }
    }

    public class StepchildModel
    {
        public int Parent { get; set; }
        public int Child { get; set; }
        public string Link { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public int SortOrder { get; set; }
    }
    public class AddLinkModel
    {
        public int FolderId { get; set; }
        public string Link { get; set; }
        public string Path { get; set; }
    }
    public class RejectLinkModel
    {
        public string Id { get; set; }
        public int PreviousLocation { get; set; }
        public string RejectionReason { get; set; }
        public string ExternalLink { get; set; }
    }

    public class MoveCopyImageModel
    {
        public int SourceFolderId { get; set; }
        public int DestinationFolderId { get; set; }
        public string Link { get; set; }
        public string Mode { get; set; }
    }

    public class RepairLinkModel
    {
        public string LinkId { get; set; }
        public int FolderId { get; set; }
        public int ParentId { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public string ImageLink { get; set; }
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
        public DateTime Modified { get; set; }
        public string Name { get; set; }
        public long Size { get; set; }

    }
    public class FtpFileInfo
    {
        public string Name { get; set; }
        public string Permissions { get; set; }
        public string Path { get; set; }

    }

    public class RepairReportModel
    {
        public RepairReportModel()
        {
            Errors = new List<string>();
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
        public string Success { get; set; }
    }

}