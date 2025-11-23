using System.Text.Json;
using BackendApi.Data;
using BackendApi.Models;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

// webapplication のビルダーを作成
var builder = WebApplication.CreateBuilder(args);

// API ドキュメント生成のための OpenAPI サービスを追加
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
// コントローラーの追加
builder.Services.AddControllers();

// DB コンテキストの設定
var connectionString = builder.Configuration.GetConnectionString("Default")
                       ?? throw new InvalidOperationException("Connection string 'Default' not found.");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString)); // PostgreSQL を使用

// 認証にはIdentityを使用
builder.Services.AddIdentityCore<ApplicationUser>(options =>
    {
        options.User.RequireUniqueEmail = true; // ユニークなメールアドレスを必須にする
        options.Password.RequiredLength = 8; // 8文字より長いパスワードにして推測耐性を上げる
        options.Password.RequireNonAlphanumeric = true; // 記号必須
        options.Password.RequireDigit = true; // 数字必須
        options.Password.RequireUppercase = true; // 大文字必須
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddApiEndpoints(); // Identity API エンドポイントを追加

// Bearer トークンによる認証を SPA/API 用に構成
builder.Services.AddAuthentication(options =>
    {
        // デフォルトスキーム、認証スキーム、チャレンジスキームを IdentityConstants.BearerScheme に設定
        options.DefaultScheme = IdentityConstants.BearerScheme;
        options.DefaultAuthenticateScheme = IdentityConstants.BearerScheme;
        options.DefaultChallengeScheme = IdentityConstants.BearerScheme;
    })
    .AddBearerToken(IdentityConstants.BearerScheme); // Bearer トークン認証を追加

// 認可サービスの追加
builder.Services.AddAuthorization();

// JSON オプションの設定
builder.Services.ConfigureHttpJsonOptions(options =>
{
    // API の JSON レスポンスをキャメルケースにする
    // フロントエンドと整合性を取るため
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

// CORS 設定
// appsettings.json または appsettings.Development.json の AllowedOrigins セクションから許可するオリジンを取得
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
                    ?? Array.Empty<string>();
// デフォルトで localhost:3000 を許可
var corsOrigins = allowedOrigins.Length > 0
    ? allowedOrigins
    : new[] { "http://localhost:3000" };

// CORS ポリシーを追加
// フロントエンドからのリクエストを許可
// 必要に応じてヘッダーやメソッドの制限を追加可能
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendCorsPolicy", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader() // すべてのヘッダーを許可
              .AllowAnyMethod() // すべてのHTTPメソッドを許可
              .AllowCredentials(); // クレデンシャルを許可
    });
});

// webapplication をビルド
var app = builder.Build();

// 生成した OpenAPI ドキュメントを開発環境でのみHTTPエンドポイントとして公開
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// HTTPS リダイレクトを有効化
app.UseHttpsRedirection();
// CORS ミドルウェアを追加
app.UseCors("FrontendCorsPolicy");
// 認証のミドルウェアを追加
app.UseAuthentication();
// 認可のミドルウェアを追加
app.UseAuthorization();
// ルーティングをマッピング
app.MapControllers();

// Identity API エンドポイントを /api/auth プレフィックスで公開
app.MapGroup("/api/auth")
    .MapIdentityApi<ApplicationUser>()
    .WithTags("Auth");

app.Run();
