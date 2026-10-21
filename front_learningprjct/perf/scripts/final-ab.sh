#!/usr/bin/env bash
# Comparación final ANTES/DESPUÉS intercalada (A, B, B, A, A, B): el ruido del equipo afecta por
# igual a los dos builds. A y B deben estar servidos (vite preview) y la API simulada en marcha.
#   bash perf/scripts/final-ab.sh http://localhost:4175 http://localhost:4173
# Después: node perf/scripts/merge.mjs --out perf/after perf/runs/fin-B-*  (y lo mismo con A)
set -u
A=${1:-http://localhost:4175}
B=${2:-http://localhost:4173}
L=perf/runs/final.log
: > "$L"
for url in "$A" "$B"; do
  until curl -s --max-time 3 -o /dev/null "$url"; do sleep 1; done
done
# Después de curl: con MSYS_NO_PATHCONV, /dev/null no se traduce y curl falla (código 23)
export MSYS_NO_PATHCONV=1
for i in 1 2 3; do
  if [ $((i % 2)) = 1 ]; then order="A B"; else order="B A"; fi
  for k in $order; do
    if [ "$k" = A ]; then url=$A; else url=$B; fi
    echo "== ronda $i · $k ($url)" >> "$L"
    PERF_BASE_URL=$url node perf/scripts/scroll.mjs --out "perf/runs/fin-$k-$i" --runs 1 --gpu real --routes "/,/sobre,/contacto,/reseñas" >> "$L" 2>&1
    PERF_BASE_URL=$url node perf/scripts/lighthouse.mjs --out "perf/runs/fin-$k-$i" --runs 1 >> "$L" 2>&1
    PERF_BASE_URL=$url node perf/scripts/mount.mjs --out "perf/runs/fin-$k-$i" --runs 2 >> "$L" 2>&1
  done
done
echo "== memoria B" >> "$L"
PERF_BASE_URL=$B node perf/scripts/scroll.mjs --out perf/runs/fin-mem --runs 1 --gpu real --only portatil --cpu 4 --routes "/" --memory 120 >> "$L" 2>&1
PERF_BASE_URL=$B node perf/scripts/scroll.mjs --out perf/runs/fin-mem-m --runs 1 --gpu real --only movil --cpu 4 --routes "/" --memory 120 >> "$L" 2>&1
echo "== FIN" >> "$L"
