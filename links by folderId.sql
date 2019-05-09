select g.*
from OggleBooble.CategoryFolder f
join OggleBooble.CategoryImageLink l on f.Id = l.ImageCategoryId
join OggleBooble.GoDaddyLink g on l.ImageLinkId = g.Id
where l.ImageCategoryId = 8
