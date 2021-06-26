//using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
//using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace OggleBooble.Core.Api.DataContext
{
    //[System.Data.Entity.DbConfigurationType(typeof(MySqlConfiguration))]
    public partial class OggleBoobleMySqlContext : DbContext
    {
        //System.ArgumentException: ''AddDbContext' was called with configuration, but the context type 'OggleBoobleMySqlContext'
        //only declares a parameterless constructor. This means that the configuration passed to 'AddDbContext' will never be used.
        //If configuration is passed to 'AddDbContext', then 'OggleBoobleMySqlContext' should declare
        //a constructor that accepts a DbContextOptions<OggleBoobleMySqlContext> and must pass it to the base constructor for DbContext.'

        public OggleBoobleMySqlContext() {
            //MySqlConnection
        }

        public OggleBoobleMySqlContext(DbContextOptions<OggleBoobleMySqlContext> mySqlCtxtOpts)
            : base(mySqlCtxtOpts)
        {
            //MySqlConnection=mySqlCtxtOpts
        }

        //        public OggleBoobleMySqlContext(string connectionString)
        //        {
        ////            this.ConnectionString = connectionString;
        //        }


        public virtual DbSet<CategoryFolder> CategoryFolders { get; set; }
        public virtual DbSet<RegisteredUser> RegisteredUsers { get; set; }
        public virtual DbSet<Visitor> Visitors { get; set; }
        //public string MySqlConnection { get; private set; }

        protected override void OnConfiguring(Microsoft.EntityFrameworkCore.DbContextOptionsBuilder options)
            => options.UseMySQL("xxx", null);
            //optionsBuilder.Options.c
            // string mySqlConnectionStr = Configuration.GetConnectionString("DefaultConnection");
            //string conn = "data source=50.62.209.107;initial catalog=OggleBooble;persist security info=True;user id=OggleUser;password=R@quel77;";
            //optionsBuilder.UseMySQL(conn, ServerVersion.AutoDetect(conn));
            //optionsBuilder.UseMySQL(conn,null);
            //base.OnConfiguring(optionsBuilder);
        

        //protected override void OnConfiguring(Microsoft.EntityFrameworkCore.Infrastructure.MySqlDbContextOptionsBuilder optionsBuilder)
        //{
        //}


        //protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        //{

        //    //   MySqlConnection = conn;

        //    optionsBuilder.UseMySql(conn, null);
        //    //optionsBuilder.UseMySQL("server=localhost;database=library;user=user;password=password", MySQLOptionsAction: null);
        //}



        //public override void on

        //public string ConnectionString { get; set; }

        //public MainTablesContext() {
        //_configuration = configuration;

        //ProviderIncompatibleException: The provider did not return a ProviderManifestToken string.

        //Sy//stem.InvalidOperationException

        //  Message = No database provider has been configured for this DbContext.
        //  A provider can be configured by overriding the 'DbContext.OnConfiguring' method or by using 'AddDbContext'
        //  on the application service provider.If 'AddDbContext' is used, then also ensure that your DbContext type accepts
        //  a DbContextOptions<TContext> object in its constructor and passes it to the base constructor for DbContext.




        //this.OnConfiguring(MySqlConnection = "");

        //string conn = "data source=50.62.209.107;initial catalog=OggleBooble;persist security info=True;user id=OggleUser;password=R@quel77;";
        // "providerName=MySql.Data.MySqlClient";
        //this.Database.Connection.ConnectionString = conn;
        //configuration.GetConnectionString("GoDaddyMySql");

        // "OracleDBConnection": "Data Source=(DESCRIPTION=(ADDRESS_LIST=(ADDRESS=(PROTOCOL=TCP)(HOST=yourhostName)
        // (PORT=1521)))(CONNECT_DATA=(SID=SEC)));User ID=yourUserId;Password=YourPassword"  

        // this.ConnectionString = "GoDaddyMySql";
        // this.ConnectionString = Configuration.GetConnectionString("GoDaddyMySql");
        //}


        //private MySqlConnection GetConnection()
        //{
        //    return new MySqlConnection(ConnectionString);
        //}
        //: base("name=GoDaddyMySql") { }

    }

    [Table("OggleBooble.CategoryFolder")]
    public partial class CategoryFolder
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int Parent { get; set; }
        public string FolderName { get; set; }
        public string RootFolder { get; set; }
        public string FolderPath { get; set; }
        public string FolderType { get; set; }
        public string FolderImage { get; set; }
        public int Files { get; set; }
        public int SubFolders { get; set; }
        public int TotalChildFiles { get; set; }
        public int TotalSubFolders { get; set; }
        public int SortOrder { get; set; }
    }

    [Table("OggleBooble.RegisteredUser")]
    public class RegisteredUser
    {
        [Key]
        public string VisitorId { get; set; }
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public DateTime Created { get; set; }
        public string Status { get; set; }
        public string UserRole { get; set; }
        public string UserSettings { get; set; }
        public int UserCredits { get; set; }
        public string Pswrd { get; set; }
        public bool IsLoggedIn { get; set; }
    }

    [Table("OggleBooble.Visitor")]
    public partial class Visitor
    {
        [Key]
        public string VisitorId { get; set; }
        public string IpAddress { get; set; }
        public string City { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public string GeoCode { get; set; }
        public int InitialPage { get; set; }
        public DateTime InitialVisit { get; set; }
    }

}
