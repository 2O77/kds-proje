<template>
  <div class="map" id="map"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const emit = defineEmits(['citySelected']) // Add 'citySelected' event
const map = ref(null)
const geoJsonUrl = '/tr-cities-utf8.json'
const selectedLayer = ref(null)

const loadMap = () => {
  map.value = L.map('map', {
    center: [38.9637, 35.2433],
    zoom: 6.5, // Default zoom level
    minZoom: 5,
    maxZoom: 10,
    zoomDelta: 0.5,
    zoomSnap: 0.5
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://github.com/ertugrulakdag/vue3-map-leafletjs" target="_blank">github.com/ertugrulakdag/vue3-map-leafletjs</a>'
  }).addTo(map.value)

  loadGeoJsonLayer()
}

const loadGeoJsonLayer = async () => {
  try {
    const response = await fetch(geoJsonUrl)
    if (!response.ok) {
      throw new Error("İl sınırları GeoJSON verisi yüklenirken hata oluştu.")
    }

    const geoJsonData = await response.json()
    console.log('GeoJSON Verisi:', geoJsonData)

    L.geoJSON(geoJsonData, {
      style: {
        color: '#a78bfa',
        weight: 3.1,
        opacity: 0.8,
        fillColor: '#c4b5fd',
        fillOpacity: 0.15
      },
      onEachFeature: (feature, layer) => {
        layer.on('click', () => {
          if (selectedLayer.value) {
            selectedLayer.value.setStyle({
              color: '#a78bfa',
              fillColor: '#c4b5fd',
              fillOpacity: 0.15
            })
          }

          layer.setStyle({
            fillColor: '#7c3aed',
            fillOpacity: 1
          })

          selectedLayer.value = layer

          emit('citySelected', feature.properties.name)
        })
      }
    }).addTo(map.value)

  } catch (error) {
    console.error("GeoJSON verisi yüklenirken hata oluştu:", error)
  }
}

onMounted(() => {
  loadMap()
})
</script>

<style>
.map {
  width: 1200px;
  height: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
