using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Models;
using WebApi.OggleBoobleSqlContext;

namespace WebApi.Controllers
{

    [EnableCors("*", "*", "*")]
    public class SlideshowController : ApiController
    {
        SlideshowItemsModel slideshowItemModel = null;
        [HttpGet]
        public SlideshowItemsModel GetSlideShowItems(int folderId, bool includeSubFolders)
        {
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            slideshowItemModel = new SlideshowItemsModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder categoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    if (categoryFolder == null)
                    {
                        slideshowItemModel.Success = "folderId "+folderId+" not found";
                        return slideshowItemModel;
                    }
                    slideshowItemModel.FolderName = categoryFolder.FolderName;
                    slideshowItemModel.RootFolder = categoryFolder.RootFolder;

                    slideshowItemModel.SlideshowItems = db.Database.SqlQuery<vwSlideshowItem>(
                        "select row_number() over(order by SortOrder, FolderId, LinkId) 'Index', * from OggleBooble.vwSlideshowItems " +
                        "where FolderId = " + folderId).ToList();

                    if (includeSubFolders)
                    {
                        GetChildGalleryItems(folderId, db);
                    }
                }
                slideshowItemModel.Success = "ok";
            }
            catch (Exception ex)
            {
                slideshowItemModel.Success = Helpers.ErrorDetails(ex);
            }
            timer.Stop();
            System.Diagnostics.Debug.WriteLine("GetImageLinks took: " + timer.Elapsed);
            return slideshowItemModel;
        }

        private void GetChildGalleryItems(int parentFolderId, OggleBoobleContext db)
        {
            slideshowItemModel.SlideshowItems.AddRange(db.Database.SqlQuery<vwSlideshowItem>(
                "select row_number() over(order by LinkId) 'Index', * from OggleBooble.vwSlideshowItems " +
                "where ImageParentId = " + parentFolderId).ToList());
            
            List<CategoryFolder> subFolders = db.CategoryFolders.Where(f => f.Parent == parentFolderId).ToList();
            foreach (CategoryFolder subFolder in subFolders)
            {
                GetChildGalleryItems(subFolder.Id, db);
            }
        }
    }


}
