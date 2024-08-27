<script lang="ts">
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import "../app.css";
  import { createEventDispatcher } from "svelte";

  let isValid = false;
  const dispatch = createEventDispatcher();

  $: {
    const regex = /^[A-Za-z]{0,2}\d{0,5}$/;
    isValid = regex.test(licensePlate) && licensePlate.length === 7;
    dispatch("validate", isValid);
  }

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.toUpperCase();

    let formatted = "";
    for (let i = 0; i < value.length && i < 7; i++) {
      if (i < 2) {
        if (/[A-Z]/.test(value[i])) {
          formatted += value[i];
        }
      } else {
        if (/\d/.test(value[i])) {
          formatted += value[i];
        }
      }
    }

    licensePlate = formatted;
  }

  let licensePlate: string = "";
  let vehicleData: any = null;
  let isLoading: boolean = false;
  let error: string | null = null;
  let insuranceStatus: string | null = null;
  let isVehicleInfoExpanded: boolean = false;
  const licensePlateRegex = /^[A-Za-z]{2}\d{5}$/;

  async function fetchVehicleData() {
    if (!licensePlate) {
      error = "Please enter a license plate";
      return;
    }

    isLoading = true;
    error = null;
    vehicleData = null;
    insuranceStatus = null;
    isVehicleInfoExpanded = false;

    try {
      const response = await fetch(`/api/lookup/${licensePlate}`);
      if (!response.ok) {
        throw new Error("Failed to fetch vehicle data");
      }
      vehicleData = await response.json();

      if (
        vehicleData &&
        vehicleData.extended &&
        vehicleData.extended.insurance &&
        vehicleData.extended.insurance.selskab
      ) {
        if (vehicleData.extended.insurance.selskab.includes("SELVFORSIKRING")) {
          insuranceStatus = "Civil politi";
        } else {
          insuranceStatus = "Privat ejet";
        }
      } else {
        insuranceStatus = "Unknown";
      }
    } catch (err) {
      error = "";
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
  <h1 class="text-2xl font-bold mb-4 text-center">CivilTjek</h1>

  <div class="flex mb-4">
    <input
      type="text"
      bind:value={licensePlate}
      on:input={handleInput}
      placeholder="Indtast nummerplade"
      maxlength="7"
      class="flex-grow px-3 py-2 border"
    />

    <!-- {#if licensePlate.length > 0}
      <p class="mt-2 text-sm {isValid ? 'text-green-600' : 'text-red-600'}">
        {isValid ? "Gyldigt nummerplade format" : "Ugyldigt nummerplade format"}
      </p>
    {/if} -->
    <button
      on:click={fetchVehicleData}
      class="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : "Søg"}
    </button>
  </div>

  {#if error}
    <p class="text-red-500 mb-4">{error}</p>
  {/if}

  {#if insuranceStatus}
    <div
      class="mb-4 p-3 rounded-md {insuranceStatus === 'Civil politi'
        ? 'bg-red-100 text-red-700'
        : 'bg-blue-100 text-blue-700'}"
    >
      <p class="font-semibold">{insuranceStatus}</p>
    </div>
  {/if}

  {#if vehicleData}
    <div class="mt-4">
      <button
        on:click={toggleVehicleInfo}
        class="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        {isVehicleInfoExpanded ? "" : ""} Bil info
      </button>

      {#if isVehicleInfoExpanded}
        <div
          transition:slide={{ duration: 300 }}
          class="mt-2 bg-gray-100 p-4 rounded-md"
        >
          <h2 class="text-xl font-semibold mb-2">Bil info</h2>
          <pre class="whitespace-pre-wrap text-sm">{JSON.stringify(
              vehicleData,
              null,
              2,
            )}</pre>
        </div>
      {/if}
    </div>
  {/if}
</div>
