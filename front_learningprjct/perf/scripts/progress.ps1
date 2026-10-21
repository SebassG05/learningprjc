# Progreso de una medicion larga. Uso (desde front_learningprjct):
#   powershell -ExecutionPolicy Bypass -File perf\scripts\progress.ps1            (medicion final)
#   powershell -ExecutionPolicy Bypass -File perf\scripts\progress.ps1 baseline   (baseline)
param([string]$Run = 'final')
$log = Join-Path $PSScriptRoot "..\runs\$Run.log"
if (-not (Test-Path $log)) { 'Aun no ha empezado'; exit }
$lines = Get-Content $log -Encoding UTF8
$lh = @($lines | Select-String ' (mobile|desktop) #\d').Count
$sc = @($lines | Select-String ' cpu\d .*#\d' | Where-Object { $_ -notmatch 'gpu-soft' }).Count
$mo = @($lines | Select-String '^(movil|portatil) cpu\d #\d').Count
$me = @($lines | Select-String '^memoria').Count
if ($Run -eq 'final') { $tot = @{ sc = 96; lh = 60; mo = 36; me = 2 } } else { $tot = @{ sc = 48; lh = 30; mo = 0; me = 2 } }
# Peso aproximado en tiempo de cada ejecucion: scroll ~30 s, Lighthouse ~20 s, montaje ~25 s, memoria ~150 s
$done = 30 * $sc + 20 * $lh + 25 * $mo + 150 * $me
$total = 30 * $tot.sc + 20 * $tot.lh + 25 * $tot.mo + 150 * $tot.me
'Scroll {0}/{1} | Lighthouse {2}/{3} | Montaje {4}/{5} | Memoria {6}/{7}  ->  {8:N0} %' -f $sc, $tot.sc, $lh, $tot.lh, $mo, $tot.mo, $me, $tot.me, [math]::Min(100, 100 * $done / $total)
if ($lines -match '^== FIN') { 'TERMINADO' } else { 'Ultima linea: ' + ($lines | Select-Object -Last 1) }
