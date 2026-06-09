$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$env:JAVA_HOME = Join-Path $root "tools\jdk-17"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

if (-not (Test-Path (Join-Path $env:JAVA_HOME "bin\java.exe"))) {
    throw "Local JDK 17 not found at $env:JAVA_HOME"
}

Push-Location (Join-Path $root "server-spring")
try {
    & (Join-Path $root "tools\apache-maven-3.9.10\bin\mvn.cmd") spring-boot:run
}
finally {
    Pop-Location
}
