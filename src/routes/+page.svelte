<script lang="ts">
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';

  let licensePlate: string = '';
  let vehicleData: any = null;
  let isLoading: boolean = false;
  let error: string | null = null;
  let insuranceStatus: string | null = null;
  let isVehicleInfoExpanded: boolean = false;
  let basicInfo: {
    maerkeTypeNavn: string;
    modelTypeNavn: string;
    modelAar: string;
    farveTypeNavn: string;
  } | null = null;

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.toUpperCase();
    
    let newValue = '';
    for (let i = 0; i < value.length && i < 7; i++) {
      if (i < 2) {
        // First two characters must be letters
        if (/[A-Z]/.test(value[i])) {
          newValue += value[i];
        }
      } else {
        // Last five characters must be numbers
        if (/[0-9]/.test(value[i])) {
          newValue += value[i];
        }
      }
    }
    
    licensePlate = newValue;
    input.value = newValue;
  }

  async function fetchVehicleData() {
    if (licensePlate.length !== 7) {
      error = 'Indtast venligst en gyldig nummerplade.';
      return;
    }

    isLoading = true;
    error = null;
    vehicleData = null;
    insuranceStatus = null;
    basicInfo = null;
    isVehicleInfoExpanded = false;

    try {
      const response = await fetch(`/api/lookup/${licensePlate}`);
      if (!response.ok) {
        throw new Error('Fejl i fetching af data.');
      }
      vehicleData = await response.json();
      
      if (vehicleData && vehicleData.extended && vehicleData.extended.insurance && vehicleData.extended.insurance.selskab) {
        if (vehicleData.extended.insurance.selskab.includes("SELVFORSIKRING")) {
          insuranceStatus = "Civil politi";
        } else {
          insuranceStatus = "Privat ejet";
        }
      } else {
        insuranceStatus = "Ukendt";
      }

      if (vehicleData && vehicleData.basic) {
        basicInfo = {
          maerkeTypeNavn: vehicleData.basic.maerkeTypeNavn || 'N/A',
          modelTypeNavn: vehicleData.basic.modelTypeNavn || 'N/A',
          modelAar: vehicleData.basic.modelAar || 'N/A',
          farveTypeNavn: vehicleData.basic.farveTypeNavn || 'N/A'
        };
      }
    } catch (err) {
      error = 'En Fejl er opstået.';
      console.error(err);
    } finally {
      isLoading = false;
    }
  }

  function toggleVehicleInfo() {
    isVehicleInfoExpanded = !isVehicleInfoExpanded;
  }

  onMount(() => {
    // Any initialization code can go here
  });
</script>

<div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
  <h1 class="text-2xl font-bold mb-4">CivilTjek</h1>
  
  <div class="flex mb-4">
    <input
      type="text"
      bind:value={licensePlate}
      on:input={handleInput}
      placeholder="Indtast nummerplade"
      maxlength="7"
      class="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 [&:not(:placeholder-shown)]:uppercase"
    />
    <button
      on:click={fetchVehicleData}
      class="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      disabled={isLoading || licensePlate.length !== 7}
    >
      {isLoading ? 'Søger...' : 'Søg'}
    </button>
  </div>

  {#if error}
    <p class="text-red-500 mb-4">{error}</p>
  {/if}


  {#if insuranceStatus}
    <div class="mb-4 p-3 rounded-md {insuranceStatus === 'Civil politi' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}">
      <p class="font-semibold">{insuranceStatus}</p>
    </div>
  {/if}

  {#if basicInfo}
    <div class="mb-4 p-4 bg-gray-100 rounded-md shadow">
      <h2 class="text-lg font-semibold mb-2">Bil Information</h2>
      <div class="grid grid-cols-2 gap-2">
        <div class="text-sm font-medium text-gray-500">Mærke:</div>
        <div class="text-sm text-gray-900">{basicInfo.maerkeTypeNavn}</div>
        <div class="text-sm font-medium text-gray-500">Model:</div>
        <div class="text-sm text-gray-900">{basicInfo.modelTypeNavn}</div>
        <div class="text-sm font-medium text-gray-500">År:</div>
        <div class="text-sm text-gray-900">{basicInfo.modelAar}</div>
        <div class="text-sm font-medium text-gray-500">Farve:</div>
        <div class="text-sm text-gray-900">{basicInfo.farveTypeNavn}</div>
      </div>
    </div>
  {/if}

 <!--  {#if vehicleData}
    <div class="mt-4">
      <button
        on:click={toggleVehicleInfo}
        class="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        {isVehicleInfoExpanded ? 'Hide' : 'Show'} Full Vehicle Information
      </button>
      
      {#if isVehicleInfoExpanded}
        <div transition:slide="{{ duration: 300 }}" class="mt-2 bg-gray-100 p-4 rounded-md">
          <h2 class="text-xl font-semibold mb-2">Full Vehicle Information</h2>
          <pre class="whitespace-pre-wrap text-sm">{JSON.stringify(vehicleData, null, 2)}</pre>
        </div>
      {/if}
    </div>
  {/if} -->
</div>