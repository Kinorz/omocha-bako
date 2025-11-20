using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddControllers();

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
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// HTTPS リダイレクトを有効化
app.UseHttpsRedirection();
// CORS ミドルウェアを追加
app.UseCors("FrontendCorsPolicy");

app.MapControllers();

app.Run();
