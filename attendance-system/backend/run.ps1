$ErrorActionPreference = "Stop"

if (-not (Get-Command javac -ErrorAction SilentlyContinue)) {
    Write-Error "javac not found. Install JDK 17+ and ensure javac is in PATH."
}

$env:DB_URL = if ($env:DB_URL) { $env:DB_URL } else { "jdbc:mysql://localhost:3306/attendease?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC" }
$env:DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "root" }
$env:DB_PASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "root" }

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$cp = ".;lib/*;src"

javac -cp $cp src/Main.java src/server/AppServer.java src/handlers/*.java src/db/DBConnection.java src/models/*.java src/utils/*.java
java -cp $cp Main
