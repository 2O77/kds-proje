<template>
    <div class="sidebar">
        <div class="title-box">
            <div class="title-text" v-if="cityName">
                <h1 class="text">{{ cityName }}</h1>
                <p class="text">datasını görmektesiniz</p>
            </div>
            <div class="title-text" v-else>
                <h1 class="text">Medicare</h1>
                <p class="text">Data görmek için şehir seçiniz</p>
            </div>
            <Button class="sidebar-button" severity="secondary" @click="handleLogout">Logout</Button>
        </div>
        <div class="sidebar-top">
            <h3 v-if="cityName">Firmamızın Hastane Sayısı: {{ totalHospitals }}</h3>
            <h3 v-else>Hastane sayısını görüntülemek için şehir seçiniz</h3>
            <canvas ref="chartCanvas"></canvas>
        </div>
        <div class="sidebar-bottom">
            <h3>Hastaneye En Çok İhtiyaç Duyan İller</h3>
            <ul>
                <li v-for="(city, index) in citiesExceedingCapacity" :key="index">
                    {{ city.sehir }} - Hasta Sayısı: {{ city.totalHastaSayisi }}, Kapasite: {{ city.totalKapasite }}
                </li>
            </ul>
        </div>
    </div>
</template>


<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { Chart, registerables } from 'chart.js';
import AuthService from '../services/AuthService';
import router from '../router';

Chart.register(...registerables);

const props = defineProps({
    cityName: {
        type: String,
        default: ''
    },
    responseData: {
        type: Array,
        default: () => []
    },
    responseDataByCity: {
        type: Array,
        default: () => []
    }
});

const chart = ref(null);
const chartCanvas = ref(null);
const totalHospitals = ref(0);
const citiesExceedingCapacity = ref([]);

const setupChart = () => {
    const canvas = chartCanvas.value.getContext('2d');
    const cityData = props.responseDataByCity.filter(item => item.sehir === props.cityName);

    console.log("response data by city", props.responseDataByCity);

    // Ensure you're getting all the data
    const years = [...new Set(cityData.map(item => item.yil))].sort((a, b) => a - b);

    // Aggregate data by year
    const hastaSayisi = years.map(
        year => cityData.filter(item => item.yil === year).reduce((sum, item) => sum + item.hasta_sayisi, 0)
    );

    const totalKapasite = years.map(
        year => cityData.filter(item => item.yil === year).reduce((sum, item) => sum + item.total_kapasite, 0)
    );

    // Calculate total hospitals for the city
    totalHospitals.value = cityData.reduce((sum, item) => sum + item.hastane_sayisi, 0);

    // Destroy the previous chart if it exists
    if (chart.value) {
        chart.value.destroy();
    }

    // Create new chart
    chart.value = new Chart(canvas, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Hasta Sayısı',
                    data: hastaSayisi,
                    backgroundColor: 'rgba(65, 158, 5, 0.6)',
                    borderColor: 'rgba(65, 158, 5, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Hastanelerin Toplam Kapasitesi',
                    data: totalKapasite,
                    backgroundColor: 'rgba(219, 33, 4, 0.6)',
                    borderColor: 'rgba(219, 33, 4, 1)',
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true,
                },
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
};


const setupCitiesExceedingCapacity = () => {
    // Log the response data correctly (without .value)
    console.log("response data:", props.responseData);

    // Aggregate all cities' patient count and capacity (not filtered by year)
    const aggregatedCities = props.responseData.reduce((acc, item) => {
        const existingCity = acc.find(city => city.sehir === item.sehir);
        if (existingCity) {
            existingCity.totalHastaSayisi += item.hasta_sayisi;
            existingCity.totalKapasite += item.total_kapasite;
        } else {
            acc.push({
                sehir: item.sehir,
                totalHastaSayisi: item.hasta_sayisi,
                totalKapasite: item.total_kapasite,
            });
        }
        return acc;
    }, []);

    // Log aggregated cities (all cities)
    console.log('Aggregated Cities (All):', aggregatedCities);

    const exceedingCities = aggregatedCities.filter(
        city => city.totalHastaSayisi > city.totalKapasite
    );

    const sortedExceedingCities = exceedingCities.sort((a, b) => {
        const diffA = a.totalHastaSayisi - a.totalKapasite;
        const diffB = b.totalHastaSayisi - b.totalKapasite;
        return diffB - diffA;
    });

    console.log('Exceeding Cities (Sorted):', sortedExceedingCities);

    citiesExceedingCapacity.value = sortedExceedingCities;
};

const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
        AuthService.logout();

        router.push('/auth');
    }
};


watch(
    () => [props.cityName, props.responseDataByCity],
    () => {
        if (props.cityName) {
            setupChart();
        }
    },
    { immediate: true, deep: true }
);

watch(
    () => props.responseData,
    (newData) => {
        if (newData && newData.length > 0) {
            setupCitiesExceedingCapacity();
        }
    },
    { immediate: true }
);


onMounted(() => {
    setupCitiesExceedingCapacity();
    setupChart();
});
</script>

<style scoped>
.sidebar {
    width: 100%;
    height: 100%;
    border-left: 1px solid var(--p-content-border-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    /* Add this line */
    transition: width 0.3s ease, opacity 0.3s ease;
}

.sidebar-top {
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 10px;
}

/* Sidebar Bottom Section */
.sidebar-bottom {
    border-top: 1px solid var(--p-content-border-color);
}

.sidebar-bottom h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    text-align: center;
}

.sidebar-bottom ul {
    list-style: none;
    padding: 10px;
    overflow-y: auto;
    max-height: 450px;
}

.sidebar-bottom li {
    display: flex;
    justify-content: space-between;
    padding: 12px;
    margin-bottom: 10px;
    border: 1px solid var(--p-content-border-color);
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Hover Effect for City Items */
.sidebar-bottom li:hover {
    background-color: #ccc8a3
}

/* City Name */
.sidebar-bottom li span.city-name {
    font-weight: bold;
    color: #555;
}

/* Patient and Capacity Data */
.sidebar-bottom li span.city-data {
    color: #777;
    font-size: 0.9rem;
}

/* Add some space between the numbers */
.sidebar-bottom li span.city-data span {
    margin-left: 5px;
    color: #333;
    font-weight: bold;
}

.horizontal-bar-chart {
    height: 300px;
}

.title-box {
    width: 100%;
    height: 111px;
    min-height: 100px;
    display: flex;
    justify-content: center;
    /* Center the title-text within the parent container */
    align-items: center;
    /* Vertically center items */
    position: relative;
    /* Required for the absolutely positioned button */

    gap: 10px;
    border-bottom: 1px solid var(--p-content-border-color);
}

.title-text {
    text-align: center;
    /* Center-align the text inside the title-text */
}

.sidebar-button {
    position: absolute;
    /* Position the button to the right */
    right: 10px;
    /* Distance from the right edge */
}


.text {
    padding: 0;
    margin: 0;
}

.sidebar-content {
    width: 90%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 30px;
    padding-bottom: 30px;
    padding-right: 10px;
    padding-left: 10px;
    gap: 60px;
}

.sidebar-content-item {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    gap: 10px;
}

.title-text {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.chart-box {
    width: 100%;
    height: auto
}
</style>
