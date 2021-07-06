using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
//using Pomelo.EntityFrameworkCore.MySql;
using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;

namespace OggleBooble.Api.Core
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        //readonly string OggleBoobleOrigins = "_oggleBoobleOrigins";
        public void ConfigureServices(IServiceCollection services)
        {

            //services.AddCors(o => o.AddPolicy("AllowAnyPolicy", builder =>
            //{
            //    builder.AllowAnyOrigin()
            //           .AllowAnyMethod()
            //           .AllowAnyHeader();
            //}));


            //services.AddCors(options =>
            //{
            //    options.AddPolicy(name: OggleBoobleOrigins,
            //    builder =>
            //    {
            //        builder.WithOrigins("https://OggleBooble.com",
            //                            "http://localhost:60457")
            //        .AllowAnyHeader().AllowAnyMethod();
            //    });
            //});

            //OggleBooble.Api.Core.Startup.ConfigureServices.AnonymousMethod__0(Microsoft.EntityFrameworkCore.DbContextOptionsBuilder) in Startup.cs
            string mySqlConnectionStr = Configuration.GetConnectionString("GoDaddyMySql");
            services.AddDbContextPool<MySqlDataContext>(options => options.UseMySql(mySqlConnectionStr, ServerVersion.AutoDetect(mySqlConnectionStr)));
            services.AddControllers();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseDefaultFiles();
            app.UseStaticFiles();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();

            app.UseRouting();

            //app.UseCors("AllowAnyPolicy");
            
            //app.UseCors(OggleBoobleOrigins);

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
