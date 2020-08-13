﻿using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OggleBooble.Api.Models
{
    public class ImageLinksModel
    {
        public ImageLinksModel() {
            Links = new List<VwLink>();
        }
        public List<VwLink> Links { get; set; }
        public string Success { get; set; }
    }

    public class MoveManyModel
    {
        public int SourceFolderId { get; set; }
        public int DestinationFolderId { get; set; }
        public string[] ImageLinkIds { get; set; }
    }

    public class SortOrderItem
    {
        public int PageId { get; set; }
        public string ItemId { get; set; }
        public int InputValue { get; set; }
    }


    public class DirTreeSuccessModel
    {
        public DirTreeSuccessModel()
        {
            SubDirs = new List<DirTreeModelNode>();
        }
        public List<DirTreeModelNode> SubDirs { get; set; }
        public TimeSpan TimeTook { get; set; }
        public string Success { get; set; }
    }

    public class DirTreeModelNode
    {
        public DirTreeModelNode()
        {
            SubDirs = new List<DirTreeModelNode>();
        }
        public List<DirTreeModelNode> SubDirs { get; set; }
        public VwDirTree VwDirTree { get; set; }
        public string DanniPath { get; set; }
    }


    public class RepairReportModel
    {
        public RepairReportModel()
        {
            //MissingFiles = new List<string>();
            //MissingLinks = new List<string>();
            //OrphanCatLinkRecs = new List<string>();
            //OrphanImageFileRecs = new List<string>();
            Errors = new List<string>();
        }
        public int PhyscialFilesProcessed { get; set; }
        public int LinkRecordsProcessed { get; set; }
        public int ImageFilesProcessed { get; set; }

        public int LinksRemoved { get; set; }
        public int ImageFilesAdded { get; set; }
        public int ImageFilesMoved { get; set; }
        public int ImageFilesZeroed { get; set; }
        public int CatLinksAdded { get; set; }
        //public int DirNotFound { get; set; }
        //public int ImagesRenamed { get; set; }
        //public int LinksEdited { get; set; }
        //public int NewLinksAdded { get; set; }
        //public int ImagesDownLoaded { get; set; }
        //public int ImagesMoved { get; set; }
        //public int BadFileNames { get; set; }
        //public int BadLinks { get; set; }
        //public bool isSubFolder { get; set; }
        //public List<string> MissingFiles { get; set; }
        //public List<string> MissingLinks { get; set; }
        //public List<string> OrphanCatLinkRecs { get; set; }
        //public List<string> OrphanImageFileRecs { get; set; }
        public List<string> Errors { get; set; }
        public string Success { get; set; }
    }
}