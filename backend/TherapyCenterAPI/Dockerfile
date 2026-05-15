# ── Build Stage ────────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore (layer-cached for speed)
COPY TherapyCenterAPI.csproj .
RUN dotnet restore TherapyCenterAPI.csproj

# Copy everything else and publish
COPY . .
RUN dotnet publish TherapyCenterAPI.csproj -c Release -o /app/publish --no-restore

# ── Runtime Stage ───────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

# Railway injects PORT; ASP.NET Core reads ASPNETCORE_URLS
ENV ASPNETCORE_URLS=http://+:${PORT:-8080}

EXPOSE 8080

ENTRYPOINT ["dotnet", "TherapyCenterAPI.dll"]
