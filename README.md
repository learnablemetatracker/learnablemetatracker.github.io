# 🌍 GeoGuessr Tracker

> Sigue tu progreso en los mapas de aprendizaje de [Learnable Meta](https://learnablemeta.com/maps)

![License](https://img.shields.io/badge/license-MIT-green)
![Stars](https://img.shields.io/badge/stars-⭐-yellow)
![Status](https://img.shields.io/badge/status-active-success)

## ✨ Características

- 📊 **Estadísticas en tiempo real** - Visualiza tu progreso con gráficos intuitivos
- 📍 **341 mapas disponibles** - Todos los mapas de Learnable Meta (Beginner, Intermediate, Advanced)
- 💾 **Sincronización automática** - Tus datos se guardan localmente en tu navegador
- 🎯 **Interfaz intuitiva** - Marcar mapas es tan simple como un click
- 🌙 **Tema oscuro/claro** - Sigue automáticamente tu preferencia del sistema
- 🚀 **100% gratuito** - Código abierto, sin anuncios, sin tracking
- ⚡ **Offline-first** - Funciona sin conexión a internet
- 📤 **Exporta/Importa** - Haz backup de tus datos en cualquier momento

## 🚀 Empezar rápidamente

1. **Abre la web**: [Abre index-landing.html en tu navegador](./index-landing.html)
2. **Explora mapas**: Ve todos los 341 mapas disponibles
3. **Juega**: Abre [Learnable Meta](https://learnablemeta.com/maps) en otra pestaña
4. **Trackea**: Marca los mapas como completados cuando los termines
5. **Monitorea**: Visualiza tu progreso con estadísticas

## 📋 Mapas incluidos

- **🟢 Beginner**: 51 mapas para comenzar
- **🟡 Intermediate**: 137 mapas de nivel medio
- **🔴 Advanced**: 153 mapas para expertos

Total: **341 mapas** de diferentes regiones y temas (ciudades, regiones, puntos de referencia, placas de vehículos, idiomas, etc.)

## 🎮 Cómo funciona

```
1. Abre el tracker          → Ves todos los mapas disponibles
2. Busca un mapa           → Filtra por dificultad o nombre
3. Juega en Learnable Meta → Abre la URL del mapa
4. Marca como completado   → Click en el botón "Marcar"
5. Visualiza progreso      → Ve estadísticas actualizadas
```

## 💾 Almacenamiento de datos

- Los datos se guardan en **localStorage** del navegador
- **No se envían a ningún servidor** - Todo es local
- **Privacidad garantizada** - Tus datos están solo en tu dispositivo
- **Persisten indefinidamente** - A menos que limpies el caché

### Exportar tus datos
```
Botón "📥 Exportar datos" → Descarga un archivo JSON con todos tus mapas
```

### Importar datos
```
Botón "📤 Importar datos" → Sube un archivo JSON previamente exportado
```

## 🛠️ Instalación local

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/geoguessr-tracker.git
cd geoguessr-tracker

# Abrir en navegador (no requiere servidor)
# Opción 1: Doble-click en index-landing.html
# Opción 2: Usar un servidor local (recomendado)
python -m http.server 8000
# Luego abre http://localhost:8000/index-landing.html
```

## 📁 Estructura del proyecto

```
geoguessr-tracker/
├── index-landing.html      # Página principal (landing page)
├── index.html              # Aplicación del tracker
├── styles-landing.css      # Estilos de landing
├── styles.css              # Estilos del tracker
├── script-landing.js       # Script de landing (globo animado)
├── script.js               # Script principal del tracker
├── README.md               # Este archivo
└── LICENSE                 # Licencia MIT
```

## 🎨 Tecnología

- **HTML5** - Semántica y estructura
- **CSS3** - Diseño responsivo con variables CSS
- **Vanilla JavaScript** - Sin dependencias externas
- **LocalStorage API** - Persistencia de datos
- **Canvas API** - Globo interactivo en landing

## 📊 Estadísticas

El tracker te muestra:

- ✅ **Total de mapas completados**
- 📈 **Desglose por dificultad** (gráfico de barras)
- 🔥 **Racha de días** (días consecutivos jugando)
- 📍 **Puntuación promedio** (si registras puntuaciones)
- 🎯 **Mapas por dificultad** (visual interactivo)

## 🌐 Responsive

- ✅ Funciona perfectamente en **desktop**
- ✅ Optimizado para **tablet**
- ✅ Totalmente **mobile-friendly**

## 🎯 Roadmap

- [ ] Sincronización en la nube (opcional)
- [ ] Compartir logros en redes sociales
- [ ] Badges y achievement system
- [ ] Competencias amistosas entre usuarios
- [ ] Recomendaciones inteligentes de mapas
- [ ] Integración con API de Learnable Meta (si está disponible)

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres mejorar el proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## ❤️ Créditos

- Inspirado en la comunidad de [GeoGuessr](https://www.geoguessr.com/)
- Mapas de [Learnable Meta](https://learnablemeta.com/maps)
- Hecho con ❤️ para los amantes de GeoGuessr

## 📞 Contacto y soporte

- 🐛 **Bug report**: Abre un [issue en GitHub](https://github.com/tu-usuario/geoguessr-tracker/issues)
- 💡 **Sugerencia**: Crea una [discussion](https://github.com/tu-usuario/geoguessr-tracker/discussions)
- 🌟 **¿Te gusta?** Dale una estrella ⭐

---

Hecho con ❤️ para dominar el mundo en GeoGuessr
