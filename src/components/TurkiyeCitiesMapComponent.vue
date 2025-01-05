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
        color: '#fbbf24',
        weight: 3.1,
        opacity: 0.8,
        fillColor: '#fcd34d',
        fillOpacity: 0.10
      },
      onEachFeature: (feature, layer) => {
        layer.on('click', () => {
          if (selectedLayer.value) {
            selectedLayer.value.setStyle({
              color: '#fbbf24',
              fillColor: '#fcd34d',
              fillOpacity: 0.15
            })
          }

          layer.setStyle({
            fillColor: '#f59e0b',
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
  const mapElement = document.getElementById('map')
  if (!mapElement) {
    console.error('Map element not found!')
    return
  }
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
