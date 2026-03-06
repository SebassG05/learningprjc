# Script para agregar una actividad optativa con PDF a un tema existente
# Uso: .\upload-actividad.ps1 -courseId "ID_DEL_CURSO" -temaId "ID_DEL_TEMA" -pdfPath "C:\ruta\al\archivo.pdf"

param(
    [Parameter(Mandatory=$true)]
    [string]$courseId,
    
    [Parameter(Mandatory=$true)]
    [string]$temaId,
    
    [Parameter(Mandatory=$true)]
    [string]$pdfPath,
    
    [Parameter(Mandatory=$false)]
    [string]$titulo = "Actividad Optativa",
    
    [Parameter(Mandatory=$false)]
    [string]$descripcion = "Ejercicios y actividades prácticas complementarias"
)

$baseUrl = "http://localhost:3007/api"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Subiendo Actividad Optativa" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que el archivo existe
if (-not (Test-Path $pdfPath)) {
    Write-Host "ERROR: El archivo no existe en la ruta especificada" -ForegroundColor Red
    exit 1
}

# Verificar que el archivo es PDF
if ([System.IO.Path]::GetExtension($pdfPath) -ne ".pdf") {
    Write-Host "ADVERTENCIA: El archivo no es un PDF" -ForegroundColor Yellow
}

Write-Host "Curso ID: $courseId" -ForegroundColor Gray
Write-Host "Tema ID: $temaId" -ForegroundColor Gray
Write-Host "Archivo: $pdfPath" -ForegroundColor Gray
Write-Host ""

Write-Host "Subiendo archivo PDF..." -ForegroundColor Yellow

try {
    # Preparar el formulario para subir el archivo
    $fileBytes = [System.IO.File]::ReadAllBytes($pdfPath)
    $fileName = [System.IO.Path]::GetFileName($pdfPath)
    $boundary = [System.Guid]::NewGuid().ToString()
    
    # Construir el cuerpo multipart/form-data
    $LF = "`r`n"
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"archivo`"; filename=`"$fileName`"",
        "Content-Type: application/pdf",
        "",
        [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($fileBytes),
        "--$boundary",
        "Content-Disposition: form-data; name=`"tipo`"",
        "",
        "pdf",
        "--$boundary",
        "Content-Disposition: form-data; name=`"titulo`"",
        "",
        $titulo,
        "--$boundary",
        "Content-Disposition: form-data; name=`"descripcion`"",
        "",
        $descripcion,
        "--$boundary",
        "Content-Disposition: form-data; name=`"orden`"",
        "",
        "1",
        "--$boundary--"
    )
    
    $body = $bodyLines -join $LF
    
    $response = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/temas/$temaId/actividades-optativas" `
        -Method POST `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $body
    
    Write-Host "   ✓ Actividad optativa subida exitosamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "  ✓ Proceso Completado" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Título: $titulo" -ForegroundColor White
    Write-Host "Descripción: $descripcion" -ForegroundColor White
    Write-Host ""
    Write-Host "Puedes ver la actividad en: http://localhost:5173/curso/$courseId" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Respuesta del servidor: $responseBody" -ForegroundColor Red
    }
    
    Write-Host ""
    exit 1
}
