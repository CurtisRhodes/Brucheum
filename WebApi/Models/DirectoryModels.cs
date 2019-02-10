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
        public string FullName { get; set; }
        public string Extension { get; set; }
    }

    public class DirectoryModel
    {
        public DirectoryModel()
        {
            Files = new List<FileModel>();
            SubDirs = new List<DirectoryModel>();
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
        public List<DirectoryModel> SubDirs { get; set; }
    }

    public class ImageLinkModel
    {
        public int PathId { get; set; }
        public string Link { get; set; }
    }

    public class MoveFolderModel
    {
        public int FolderToMoveId { get; set; }
        public int NewParentId { get; set; }
    }

    public class ImageFolderModel
    {
        public int Id { get; set; }
        public int Parent { get; set; }
        public string FolderName { get; set; }
        public string FolderPath { get; set; }
        public int FileCount { get; set; }
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

    public class FolderLinkModel
    {
        public string RootFolder { get; set; }
        public string Parent { get; set; }
        public string FolderName { get; set; }
        public string FolderPath { get; set; }
        public int FileCount { get; set; }
        public string Link { get; set; }
        public string LinkId { get; set; }
    }

}