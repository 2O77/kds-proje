<template>
    <div class="dashboard-page">
        <div class="sidebar-section">
            <DashboardSidebar :cityName="selectedCity" :responseDataByCity="responseDataByCity"
                :responseData="responseData" />
        </div>
        <div class="main">
            <div class="map-section">
                <TurkiyeCitiesMapComponent @citySelected="handleCitySelected" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import TurkiyeCitiesMapComponent from '../components/TurkiyeCitiesMapComponent.vue';
import DashboardSidebar from '../components/DashboardSidebar.vue';
import AuthService from '../services/AuthService';

const selectedCity = ref('');
const responseDataByCity = ref([]);
const responseData = ref([]);

const handleCitySelected = (cityName) => {
    if (cityName) {
        selectedCity.value = cityName;
        console.log('Selected city:', cityName);
    } else {
        console.warn('No city selected');
    }
};

const sendDashboardRequestByCity = async () => {
    if (!selectedCity.value) return;

    try {
        console.log('Sending request for city:', selectedCity.value);

        const response = await fetch(`http://localhost:3001/potentials/${selectedCity.value}`);

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();

        console.log('Response data by city:', data);

        responseDataByCity.value = data;

        console.log('Response data by city:', responseDataByCity.value);
    } catch (error) {
        console.error('Error fetching data:', error);
        responseDataByCity.value = [];
    }
};

const sendDashboardRequest = async () => {
    try {
        console.log('Sending request for city:', selectedCity.value);

        const response = await fetch(`http://localhost:3001/potentials`);

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();

        console.log('Response data:', data);

        responseData.value = data;
    } catch (error) {
        console.error('Error fetching data:', error);
        responseData.value = [];
    }
}

const getToken = async () => {
    try {
        const token = await AuthService.getToken();
        if (!token) {
            throw new Error('Invalid token');
        }

        console.log('Token:', token);
    } catch (error) {
        console.error('Failed to get token', error.message);
        router.push('/auth');
    }
};

watch(selectedCity, (newVal) => {
    sendDashboardRequestByCity();  // Fetch data when the selected city changes
}, { immediate: true });

onMounted(async () => {
    await sendDashboardRequest();  // Fetch data when the component is mounted
    await getToken();  // Get token when the component is mounted
});
</script>


<style scoped>
.dashboard-page {
    width: 100%;
    height: 100%;
    display: flex;
}

.sidebar-section {
    width: 700px;
}

.sidebar-not-visible {
    width: 0;
    opacity: 0;
    overflow: hidden;
}

.topbar-section {
    height: 100px;
    width: 100%;
}

.map-section {
    display: flex;
    width: 100%;
    height: 100%;
    margin-bottom: 15px;
    margin-left: 5px;
    justify-content: center;
    align-items: center;
}

.main {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}
</style>
