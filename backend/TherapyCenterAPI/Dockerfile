# ── Build Stage ────────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY backend/TherapyCenterAPI/TherapyCenterAPI.csproj backend/TherapyCenterAPI/
RUN dotnet restore backend/TherapyCenterAPI/TherapyCenterAPI.csproj

COPY backend/TherapyCenterAPI/ backend/TherapyCenterAPI/
RUN dotnet publish backend/TherapyCenterAPI/TherapyCenterAPI.csproj -c Release -o /app/publish --no-restore

# ── Runtime Stage ───────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

# Use shell form so $PORT is expanded at container runtime (not build time)
ENTRYPOINT ["sh", "-c", "dotnet TherapyCenterAPI.dll --urls http://+:${PORT:-8080}"]
