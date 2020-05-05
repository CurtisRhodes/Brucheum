using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OggleBooble.Api.Models
{
    public class UsersRoleModel
    {
        public UsersRoleModel(){
            RegisteredUsers = new List<UsersModel>();
        }
        public List<UsersModel> RegisteredUsers { get; set; }
        public string Success { get; set; }
    }

    public class UsersModel
    {
        public string UserNames { get; set; }
        public string VisitorId { get; set; }
    }
}