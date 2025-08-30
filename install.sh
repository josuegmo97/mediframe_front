#!/bin/bash

# MediFrame Dashboard Installation Script
echo "🏥 Instalando MediFrame Dashboard..."
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 16+ primero."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js versión 16+ requerida. Versión actual: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) detectado"

# Install dependencies
echo "📦 Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error instalando dependencias"
    exit 1
fi

# Create .env from example if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env 2>/dev/null || echo "VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=MediFrame
VITE_APP_VERSION=1.0.0" > .env
    echo "✅ Archivo .env creado"
fi

echo ""
echo "🎉 ¡Instalación completada!"
echo "======================================"
echo "📋 Próximos pasos:"
echo ""
echo "1. Configura tu backend API en .env si es necesario"
echo "2. Ejecuta: npm run dev"
echo "3. Abre: http://localhost:5173"
echo ""
echo "📚 Comandos disponibles:"
echo "   npm run dev     - Servidor de desarrollo"
echo "   npm run build   - Build para producción"  
echo "   npm run preview - Preview del build"
echo "   npm run lint    - Linting del código"
echo ""
echo "🔗 Documentación: README.md"
echo "🆘 Soporte: https://github.com/mediframe/dashboard/issues"
echo ""