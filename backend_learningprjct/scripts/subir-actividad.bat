@echo off
REM ========================================
REM Script Simple para Subir Actividad Optativa
REM ========================================

echo.
echo =====================================
echo   Subir Actividad Optativa al Tema
echo =====================================
echo.

REM Solicitar datos al usuario
set /p COURSE_ID="Ingresa el ID del curso: "
set /p TEMA_ID="Ingresa el ID del tema: "
set /p PDF_PATH="Ingresa la ruta completa del PDF: "
set /p TITULO="Titulo de la actividad (ej: Ejercicios Practicos 1): "

echo.
echo Procesando...
echo.

REM Subir la actividad optativa
echo Subiendo actividad optativa...
curl -X POST "http://localhost:3007/api/courses/%COURSE_ID%/temas/%TEMA_ID%/actividades-optativas" ^
  -F "archivo=@%PDF_PATH%" ^
  -F "tipo=pdf" ^
  -F "titulo=%TITULO%" ^
  -F "descripcion=Actividad practica complementaria" ^
  -F "orden=1"

echo.
echo.
echo =====================================
echo   Actividad Subida Exitosamente
echo =====================================
echo.
echo La actividad optativa ha sido agregada al tema.
echo Recarga la pagina del curso para verla.
echo.
echo URL del curso: http://localhost:5173/curso/%COURSE_ID%
echo.

pause
