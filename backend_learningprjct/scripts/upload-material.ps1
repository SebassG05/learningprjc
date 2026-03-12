# Script para agregar un tema con material PDF al curso
# Uso: .\upload-material.ps1 -courseId "ID_DEL_CURSO" -pdfPath "C:\ruta\al\archivo.pdf"

param(
    [Parameter(Mandatory=$true)]
    [string]$courseId,
    
    [Parameter(Mandatory=$true)]
    [string]$pdfPath,
    
    [Parameter(Mandatory=$false)]
    [int]$numeroTema = 1,
    
    [Parameter(Mandatory=$false)]
    [string]$tituloTema = "Tema 1",
    
    [Parameter(Mandatory=$false)]
    [string]$descripcionTema = "Material de estudio del tema",
    
    [Parameter(Mandatory=$false)]
    [string]$tituloMaterial = "Material de Estudio",
    
    [Parameter(Mandatory=$false)]
    [string]$descripcionMaterial = "Documento PDF con el contenido del tema"
)

$baseUrl = "http://localhost:8547/api"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Subiendo Material al Curso" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que el archivo existe
if (-not (Test-Path $pdfPath)) {
    Write-Host "ERROR: El archivo no existe en la ruta especificada" -ForegroundColor Red
    exit 1
}

Write-Host "1. Creando tema '$tituloTema'..." -ForegroundColor Yellow

# Crear el tema
$temaBody = @{
    numeroTema = $numeroTema
    titulo = $tituloTema
    descripcion = $descripcionTema
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/temas" `
        -Method POST `
        -Body $temaBody `
        -ContentType "application/json"
    
    # Obtener el ID del tema creado
    $temaId = $response.temas[-1]._id
    Write-Host "   ✓ Tema creado exitosamente (ID: $temaId)" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "2. Subiendo archivo PDF..." -ForegroundColor Yellow
    
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
        $tituloMaterial,
        "--$boundary",
        "Content-Disposition: form-data; name=`"descripcion`"",
        "",
        $descripcionMaterial,
        "--$boundary",
        "Content-Disposition: form-data; name=`"orden`"",
        "",
        "1",
        "--$boundary--"
    )
    
    $body = $bodyLines -join $LF
    
    $materialResponse = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/temas/$temaId/materiales" `
        -Method POST `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $body
    
    Write-Host "   ✓ Material subido exitosamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "  ✓ Proceso Completado" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Puedes ver el material en: http://localhost:5173/curso/$courseId" -ForegroundColor Cyan
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
