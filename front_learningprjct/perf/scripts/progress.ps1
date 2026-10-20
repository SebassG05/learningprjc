# Progreso del baseline. Uso (desde front_learningprjct):
#   powershell -ExecutionPolicy Bypass -File perf\scripts\progress.ps1
$log = Join-Path $PSScriptRoot '..\runs\baseline.log'
if (-not (Test-Path $log)) { 'Aun no ha empezado'; exit }
$lines = Get-Content $log -Encoding UTF8
$lh = @($lines | Select-String ' (mobile|desktop) #\d').Count
$sc = @($lines | Select-String ' cpu\d .*#\d:' | Where-Object { $_ -notmatch 'gpu-soft' }).Count
$me = @($lines | Select-String '^memoria').Count
$sw = @($lines | Select-String 'gpu-soft #\d').Count
# Peso aproximado en tiempo: Lighthouse ~20 s, scroll ~25 s, memoria ~150 s, GPU software ~30 s por ejecucion
$done = 20 * $lh + 25 * $sc + 150 * $me + 30 * $sw
$total = 20 * 30 + 25 * 48 + 150 * 2 + 30 * 10
'Lighthouse {0}/30 | Scroll {1}/48 | Memoria {2}/2 | GPU software {3}/10  ->  {4:N0} %' -f $lh, $sc, $me, $sw, (100 * $done / $total)
if ($lines -match '^== FIN') { 'TERMINADO' } else { 'Ultima linea: ' + ($lines | Select-Object -Last 1) }
