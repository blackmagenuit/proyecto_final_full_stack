# 📤 Instrucciones para Hacer Push a GitHub

## ✅ Commits Listos para Hacer Push

Tu repositorio tiene **2 commits listos** para sincronizar con GitHub:

```
b5177ee docs: Mejorar README con badges
67fe8f7 🚀 feat: Sistema de Gestión de Stock Full Stack (35 archivos)
```

---

## 🔧 Opción 1: Desde VS Code (Recomendado)

### Paso 1: Abre la carpeta del proyecto
```bash
# En VS Code:
File > Open Folder
# Selecciona: /home/claude/proyecto_repo
```

### Paso 2: Ve a Source Control
- Presiona: `Ctrl + Shift + G` (Windows/Linux) o `Cmd + Shift + G` (Mac)
- Verás todos los commits listos

### Paso 3: Haz click en "Publish Branch"
- O en el menú: `Source Control > Publish to GitHub`
- Selecciona la opción "Authorize with GitHub"
- VS Code abrirá tu navegador para autenticación
- Autoriza y vuelve a VS Code

### ✅ ¡Listo! Los cambios se subirán automáticamente

---

## 💻 Opción 2: Desde Terminal (Con Token)

### Paso 1: Obtén un Personal Access Token
1. Ve a: https://github.com/settings/tokens
2. Click en "Generate new token" → "Generate new token (classic)"
3. Dale un nombre: `stock-app-push`
4. Selecciona permisos:
   - ☑ `repo` (acceso completo al repositorio)
5. Genera el token y **cópialo** (solo aparecerá una vez)

### Paso 2: Haz push desde terminal

```bash
cd /home/claude/proyecto_repo
git push -u origin main
```

Cuando pida credenciales:
- **Username**: `blackmagenuit` (tu usuario)
- **Password**: Pega el token que copiaste (no tu contraseña)

---

## 🔑 Opción 3: Configurar SSH (Permanente)

Si usas SSH, es más seguro que tokens:

```bash
# Verifica que tengas clave SSH
ls -la ~/.ssh/id_rsa

# Si no existe, genera una:
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa

# Copia la clave pública a GitHub:
# 1. Ve a: https://github.com/settings/keys
# 2. "New SSH key"
# 3. Pega el contenido de: ~/.ssh/id_rsa.pub

# Cambia la URL remota:
git remote set-url origin git@github.com:blackmagenuit/proyecto_final_full_stack.git

# Ahora puedes hacer push sin contraseña:
git push -u origin main
```

---

## ✨ Verificar que Funcionó

Después de hacer push, abre tu repositorio:
https://github.com/blackmagenuit/proyecto_final_full_stack

Deberías ver:
- ✅ Rama `main` con 2 commits
- ✅ Carpetas: `backend`, `frontend`, etc.
- ✅ README.md con badges

---

## 🆘 Si Algo Sale Mal

### Error: "Authentication failed"
```bash
# Borra las credenciales guardadas
git credential-cache exit
# O en Windows:
git credential.helper=manager-core

# Intenta de nuevo
git push -u origin main
```

### Error: "Updates were rejected"
```bash
git pull origin main
git push origin main
```

### ¿Necesitas cambiar usuario de Git?
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

---

## 🎉 ¡Listo!

Una vez que hagas push, tu proyecto estará en:
**https://github.com/blackmagenuit/proyecto_final_full_stack**

¡A compartir tu trabajo! 🚀
