---
name: session-notes
description: Genera notas de sesión con resumen de trabajo realizado
---

# Skill: Notas de Sesión

Cuando el usuario pida "guardar notas" o "cerrar sesión", genera un archivo Markdown en `docs/session-notes/` con este formato:

## Nombre del archivo

`YYYY-MM-DD-HH-MM.md` (fecha y hora actual)

## Plantilla

```markdown
# Sesión [FECHA]

## 🎯 Objetivo de la sesión

[Qué se intentaba lograr]

## ✅ Completado

- [Lista de tareas terminadas]

## 🚧 En progreso

- [Tareas iniciadas pero no terminadas]

## 📁 Archivos modificados

- `ruta/archivo.tsx` - [descripción breve]

## 🐛 Bugs encontrados

- [Si aplica]

## 📝 Notas técnicas

[Decisiones importantes, patrones usados, etc.]

## ⏭️ Próxima sesión

- [ ] [Siguiente tarea 1]
- [ ] [Siguiente tarea 2]
```

## Instrucciones

1. Revisa el historial de la conversación actual
2. Extrae información relevante
3. Crea el archivo con la plantilla
4. Confirma al usuario la ruta del archivo
