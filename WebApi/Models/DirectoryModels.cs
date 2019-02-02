using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApi.Directory.Models
{
    public class FileModel
    {
        public string FileName { get; set; }
        public DateTime Created { get; set; }
        public long Length { get; set; }
        public string FullName { get; set; }
        public string Extension { get; set; }
    }
    public class FolderModel
    {
        public FolderModel()
        {
            Files = new List<FileModel>();
            SubDirs = new List<FolderModel>();
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
        public List<FolderModel> SubDirs { get; set; }
    }

    //public class LinkTreeModel
    //{
    //    public LinkTreeModel()
    //    {
    //        SubDirs = new List<LinkTreeModel>();
    //    }
    //    public int Id { get; set; }
    //    public string Name { get; set; }
    //    public string FullName { get; set; }
    //    public int Ccount { get; set; }
    //    public List<LinkTreeModel> SubDirs { get; set; }
    //}

    //public class ImagePathModel
    //{
    //    public string Link { get; set; }
    //    public string Path { get; set; }
    //}

    public class LinkModel
    {
        public string Link { get; set; }
        public string Path { get; set; }
    }

    public class TreeItem 
    {
        public int Id { get; set; }
        public int Parent { get; set; }
        public string FolderName { get; set; }
        public string FolderPath { get; set; }
        public int FileCount { get; set; }
    }


}