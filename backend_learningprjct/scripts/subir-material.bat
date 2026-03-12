@echo off
REM ========================================
REM Script Simple para Subir Material PDF
REM ========================================

echo.
echo =====================================
echo   Agregar Material PDF al Curso
echo =====================================
echo.

REM Solicitar datos al usuario
set /p COURSE_ID="Ingresa el ID del curso: "
set /p PDF_PATH="Ingresa la ruta completa del PDF: "
set /p TEMA_TITULO="Titulo del tema (ej: Tema 1 - Introduccion): "

echo.
echo Procesando...
echo.

REM Paso 1: Crear el tema
echo 1. Creando tema...
curl -X POST "http://localhost:8547/api/courses/%COURSE_ID%/temas" ^
  -H "Content-Type: application/json" ^
  -d "{\"numeroTema\": 1, \"titulo\": \"%TEMA_TITULO%\", \"descripcion\": \"Material de estudio\"}" ^
  -o response.json

echo.
echo    Tema creado exitosamente
echo.

REM Nota: Para el paso 2, necesitarías parsear el JSON para obtener el temaId
REM Por simplicidad, este script muestra el comando que debes ejecutar

echo =====================================
echo   Siguiente Paso
echo =====================================
echo.
echo Para subir el PDF, necesitas el ID del tema que se acaba de crear.
echo Abre el archivo response.json y busca el ultimo '_id' dentro de 'temas'.
echo.
echo Luego ejecuta este comando (reemplazando TEMA_ID):
echo.
echo curl -X POST "http://localhost:8547/api/courses/%COURSE_ID%/temas/TEMA_ID/materiales" \
echo   -F "archivo=@%PDF_PATH%" \
echo   -F "tipo=pdf" \
echo   -F "titulo=Material de Estudio" \
echo   -F "descripcion=Documento PDF del tema" \
echo   -F "orden=1"
echo.
echo =====================================
echo.

del response.json

pause
