using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MySql.Data.MySqlClient;
using OggleBooble.Core.Api.DataContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OggleBooble.Core.Api
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.

        public void ConfigureServices(IServiceCollection services)
        {

            string mySqlConnectionStr = Configuration.GetConnectionString("GoDaddyMySql");
            //services.AddDbContextPool<OggleBoobleMySqlContext>(options => options.UseMySql(mySqlConnectionStr, ServerVersion.AutoDetect(mySqlConnectionStr)));

            services.AddDbContext<OggleBoobleMySqlContext>(
                options => options.UseMySql(
                    mySqlConnectionStr,
                    ServerVersion.AutoDetect(mySqlConnectionStr)));


            //services.ConfigureOptions(`)
            //services.AddDbContext<MainTablesContext>(options =>
            //    options.UseSqlServer(Configuration.GetConnectionString("BloggingDatabase")));

            // services.AddTransient<MySqlConnection>(_ => new MySqlConnection(Configuration["ConnectionStrings:GoDaddyMySql"]));

            services.AddControllers();
            //services.AddMvc();


            //services.Add(new ServiceDescriptor(typeof(MainTablesContext), new MainTablesContext(Configuration.GetConnectionString("GoDaddyMySql"))));
            //optionsBuilder.UseSqlServer(connectionString);

            //services.AddOptions();
            //services.Configure<ConnectionStringOption>(options =>
            //{
            //    // set connection string from configuration  
            //    options.ConStr = Configuration.GetConnectionString("Default");
            //});
            //DependencyResolver.ServiceProvider = services.BuildServiceProvider();


        }
        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {

            //loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            //loggerFactory.AddDebug();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                //app.UseBrowserLink();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseDefaultFiles();
            app.UseStaticFiles();

            //RouteTable.Routes.MapHttpRoute(
            //    name: "DefaultApi",
            //    routeTemplate: "api/{controller}/{action}/{id}",
            //    defaults: new { id = RouteParameter.Optional }
            //);

            //GlobalConfiguration.Configuration.EnsureInitialized();

            //IConfiguration

            //app.UseMvc(routes =>
            //{
            //    routes.MapRoute(
            //        name: "default",
            //        template: "{controller=Home}/{action=Index}/{id?}");
            //});

            app.UseHttpsRedirection();

            app.UseRouting();

            //app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
            });

            //app.UseEndpoints(endpoints =>
            //{
            //    endpoints.MapControllers();
            //});

        }
    }
}
