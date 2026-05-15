# ── Build Stage ────────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore (layer-cached for speed)
# Context is the repo root, so paths are relative to that
COPY backend/TherapyCenterAPI/TherapyCenterAPI.csproj backend/TherapyCenterAPI/
RUN dotnet restore backend/TherapyCenterAPI/TherapyCenterAPI.csproj

# Copy the rest of the backend source and publish
COPY backend/TherapyCenterAPI/ backend/TherapyCenterAPI/
RUN dotnet publish backend/TherapyCenterAPI/TherapyCenterAPI.csproj -c Release -o /app/publish --no-restore

# ── Runtime Stage ───────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

# Railway injects PORT; ASP.NET Core reads ASPNETCORE_URLS
ENV ASPNETCORE_URLS=http://+:${PORT:-8080}

EXPOSE 8080

ENTRYPOINT ["dotnet", "TherapyCenterAPI.dll"]
