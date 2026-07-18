#!/bin/bash
# ============================================================
# WingConcept Backend — Auditoría de Seguridad
# Verifica dependencias con vulnerabilidades conocidas
# ============================================================

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "WingConcept — Auditoría de Seguridad"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar que estamos en el directorio backend
if [ ! -f "requirements.txt" ]; then
    echo " Error: requirements.txt no encontrado"
    echo "   Ejecutar desde: /backend/"
    exit 1
fi

echo "Verificando instalación de herramientas..."

# Verificar si safety está instalado
if ! command -v safety &> /dev/null; then
    echo "⚠️  safety no está instalado"
    echo "   Instalando: pip install safety"
    pip install safety
fi

echo "Herramientas listas"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Escaneando dependencias con Safety..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ejecutar safety check
safety check --json > /tmp/safety_report.json 2>&1 || true

# Verificar si hay vulnerabilidades
if [ -s /tmp/safety_report.json ]; then
    VULNERABILITIES=$(cat /tmp/safety_report.json | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('vulnerabilities', [])))" 2>/dev/null || echo "0")

    if [ "$VULNERABILITIES" -gt "0" ]; then
        echo " Se encontraron $VULNERABILITIES vulnerabilidades:"
        echo ""
        cat /tmp/safety_report.json | python3 -c "
import sys, json
data = json.load(sys.stdin)
for vuln in data.get('vulnerabilities', []):
    print(f\"{vuln['package_name']} {vuln['installed_version']}\")
    print(f\"   CVE: {vuln.get('vulnerability_id', 'N/A')}\")
    print(f\"   Severidad: {vuln.get('severity', 'Unknown')}\")
    print(f\"   Fix: Actualizar a {vuln.get('fixed_version', 'versión no especificada')}\")
    print()
        "
        echo ""
        echo "Acciones recomendadas:"
        echo "   1. Revisar cada vulnerabilidad"
        echo "   2. Actualizar dependencias afectadas"
        echo "   3. Probar la aplicación tras actualizar"
        echo "   4. Volver a ejecutar este script"
        exit 1
    else
        echo " No se encontraron vulnerabilidades conocidas"
    fi
else
    echo " No se encontraron vulnerabilidades conocidas"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Verificando configuración de seguridad..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar variables críticas en .env.example
if [ -f ".env.example" ]; then
    echo " .env.example encontrado"

    # Verificar variables críticas
    CRITICAL_VARS=("SECRET_KEY" "DATABASE_URL" "REDIS_PASSWORD" "STRIPE_WEBHOOK_SECRET")

    for VAR in "${CRITICAL_VARS[@]}"; do
        if grep -q "^$VAR=" .env.example; then
            echo "   ✓ $VAR documentado"
        else
            echo "     $VAR no está en .env.example"
        fi
    done
else
    echo "  .env.example no encontrado"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Verificando archivos sensibles..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar .gitignore
if [ -f "../.gitignore" ]; then
    if grep -q "^\.env$" ../.gitignore; then
        echo " .env está en .gitignore"
    else
        echo "  .env NO está en .gitignore (riesgo de commit accidental)"
    fi

    if grep -q "^\.env\.local$" ../.gitignore; then
        echo " .env.local está en .gitignore"
    else
        echo "  .env.local NO está en .gitignore"
    fi
else
    echo "  .gitignore no encontrado en directorio raíz"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Auditoría completada"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Reporte guardado en: /tmp/safety_report.json"
echo ""

rm -f /tmp/safety_report.json

