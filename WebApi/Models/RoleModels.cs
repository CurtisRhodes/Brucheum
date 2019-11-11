using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApi.Models
{
    public class UsersModel
    {
        public UsersModel()
        {
            UserNames = new List<string>();
        }
        public List<string> UserNames { get; set; }
        public string Success { get; set; }
    }

    public class RoleModel
    {
        public RoleModel()
        {
            RoleNames = new List<string>();
        }
        public List<string> RoleNames { get; set; }
        public string Success { get; set; }
    }

    public class UserRoleModel
    {
        public string UserName { get; set; }
        public string RoleName { get; set; }
    }
}