#!/bin/bash
# Instala MongoDB 8.0 en la VM BountyLine-MongoDB y carga la base bountyline.
# Se puede volver a ejecutar: recarga la base desde cero.
set -e
ORIGEN="$(cd "$(dirname "$0")" && pwd)"
ADMIN_PWD='BountyAdmin2026*'

if ! grep -qw avx /proc/cpuinfo; then
    echo "!! La CPU de la VM no tiene AVX y MongoDB 8 no puede arrancar sin esa instrucción."
    echo "!! Revise en VirtualBox que Hyper-V no esté activo en Windows."
    exit 1
fi

if ! command -v mongod >/dev/null; then
    echo "== Instalando MongoDB 8.0 y SSH"
    apt-get update
    DEBIAN_FRONTEND=noninteractive apt-get install -y gnupg curl openssh-server
    curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | gpg --dearmor --yes -o /usr/share/keyrings/mongodb-server-8.0.gpg
    # MongoDB publica paquetes para Ubuntu 24.04 (noble); se usan en esta versión de Ubuntu.
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" \
        > /etc/apt/sources.list.d/mongodb-org-8.0.list
    apt-get update
    DEBIAN_FRONTEND=noninteractive apt-get install -y mongodb-org
fi
systemctl enable --now mongod ssh 2>/dev/null || systemctl enable --now mongod

echo "== Esperando a que MongoDB arranque"
for i in $(seq 1 30); do
    mongosh --quiet --eval 'db.runCommand({ ping: 1 }).ok' >/dev/null 2>&1 && break
    sleep 2
done

echo "== Copiando scripts a /opt/bountyline/mongodb"
mkdir -p /opt/bountyline/mongodb
cp "$ORIGEN"/0*.js /opt/bountyline/mongodb/
sed -i 's/\r$//' /opt/bountyline/mongodb/*.js

AUTH=()
if grep -q '^  authorization: enabled' /etc/mongod.conf; then
    AUTH=(-u bountyline_admin -p "$ADMIN_PWD" --authenticationDatabase admin)
fi

echo "== Cargando la base de datos"
for f in 01_colecciones.js 02_insercion.js 03_usuarios.js; do
    echo "-- $f"
    mongosh --quiet "${AUTH[@]}" "/opt/bountyline/mongodb/$f"
done

echo "== Habilitando conexiones remotas y autenticación"
sed -i 's/^  bindIp: .*/  bindIp: 0.0.0.0/' /etc/mongod.conf
if ! grep -q '^security:' /etc/mongod.conf; then
    sed -i 's/^#security:.*/security:\n  authorization: enabled/' /etc/mongod.conf
    grep -q '^security:' /etc/mongod.conf || printf '\nsecurity:\n  authorization: enabled\n' >> /etc/mongod.conf
fi
systemctl restart mongod
sleep 4

echo "== Comprobando con el usuario de la aplicación"
mongosh --quiet "mongodb://bountyline_app:BountyApp2026*@127.0.0.1:27017/bountyline?authSource=admin" \
    --eval 'print("publicaciones: " + db.publicaciones.countDocuments() + ", mensajes: " + db.mensajes_chat.countDocuments() + ", eventos: " + db.bitacora_actividad.countDocuments())'
echo
echo "== LISTO: MongoDB cargado. Desde Windows: 127.0.0.1:27018 (usuario bountyline_app)"
