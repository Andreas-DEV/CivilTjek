<script lang="ts">
  import { onMount } from "svelte";
  import "../app.css";
  import { inject } from "@vercel/analytics";
  import { slide, fade } from "svelte/transition";
  import { quintOut } from "svelte/easing";

  let licensePlate: string = "";
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

    let newValue = "";
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

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter" && licensePlate.length === 7 && !isLoading) {
      fetchVehicleData();
    }
  }

  let showResults = false;

  async function fetchVehicleData() {
    if (licensePlate.length !== 7) {
      error = "Indtast venligst en gyldig nummerplade.";
      return;
    }

    isLoading = true;
    error = null;
    vehicleData = null;
    insuranceStatus = null;
    basicInfo = null;
    isVehicleInfoExpanded = false;
    showResults = false;

    try {
      // Simulate a delay to make the loading state more noticeable
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await fetch(`/api/lookup/${licensePlate}`);
      if (!response.ok) {
        throw new Error("Fejl i fetching af data.");
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
        insuranceStatus = "Ukendt";
      }

      if (vehicleData && vehicleData.basic) {
        basicInfo = {
          maerkeTypeNavn: vehicleData.basic.maerkeTypeNavn || "N/A",
          modelTypeNavn: vehicleData.basic.modelTypeNavn || "N/A",
          modelAar: vehicleData.basic.modelAar || "N/A",
          farveTypeNavn: vehicleData.basic.farveTypeNavn || "N/A",
        };
      }

      // Set showResults to true after data is fetched
      showResults = true;
    } catch (err) {
      error = "Fejl i fetching af data.";
      console.error(err);
    } finally {
      isLoading = false;
    }
  }

  function toggleVehicleInfo() {
    isVehicleInfoExpanded = !isVehicleInfoExpanded;
  }

  function expandAnimation(node, { duration = 300, easing = quintOut }) {
    return {
      duration,
      easing,
      css: (t) => `max-height: ${t * 1000}px; opacity: ${t}`,
    };
  }

  onMount(() => {
    // Any initialization code can go here
  });

  function getColorClass(color) {
    switch (color.toLowerCase()) {
      case "rød":
        return "text-red-600";
      case "blå":
        return "text-blue-600";
      case "grøn":
        return "text-green-600";
      case "gul":
        return "text-yellow-600";
      case "sort":
        return "text-black";
      case "brun":
        return "text-amber-700";
      case "lilla":
        return "text-purple-600";
      default:
        return "text-gray-900";
    }
  }
</script>

<div
  class="min-h-screen w-full flex items-center justify-center p-4 bg-orange-50"
>
  <div
    class="w-full max-w-md mx-auto bg-white rounded-lg shadow-[0_10px_30px_rgba(51,_51,_51,_0.1)] overflow-hidden"
  >
    <div class="p-6 space-y-4">
      <h1 class="text-3xl font-bold text-center select-none mb-10 mt-5">
        <span class="text-[#8c3814]">Civil</span><span class="text-[#333]"
          >Tjek</span
        >
      </h1>

      <div class="flex">
        <input
          type="text"
          bind:value={licensePlate}
          on:input={handleInput}
          on:keypress={handleKeyPress}
          placeholder="Indtast nummerplade"
          maxlength="7"
          class="flex-grow px-4 py-3 border-2 border-gray-300 rounded-l-lg [&:not(:placeholder-shown)]:uppercase focus:outline-none"
        />
        <button
          on:click={fetchVehicleData}
          class="px-6 py-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none"
          disabled={isLoading || licensePlate.length !== 7}
        >
          {isLoading ? "Søger..." : "Søg"}
        </button>
      </div>

      {#if showResults}
        <div transition:expandAnimation={{ duration: 500 }} class="space-y-4">
          {#if error}
            <p
              transition:fade={{ duration: 300 }}
              class="text-red-500 text-center"
            >
              {error}
            </p>
          {/if}

          {#if insuranceStatus}
            <div
              transition:fade={{ duration: 300, delay: 300 }}
              class="p-3 rounded-lg text-center font-semibold {insuranceStatus ===
              'Civil politi'
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'}"
            >
              {insuranceStatus}
            </div>
          {/if}

          {#if basicInfo}
            <div
              transition:fade={{ duration: 300, delay: 600 }}
              class="p-6 bg-gray-50 rounded-lg shadow-inner"
            >
              <h2 class="text-xl font-semibold mb-4">Bil Information</h2>
              <div class="grid grid-cols-2 gap-4">
                <div class="text-sm font-medium text-gray-500">Mærke</div>
                <div class="text-sm text-gray-900">
                  {basicInfo.maerkeTypeNavn}
                </div>
                <div class="text-sm font-medium text-gray-500">Model</div>
                <div class="text-sm text-gray-900">
                  {basicInfo.modelTypeNavn}
                </div>
                <div class="text-sm font-medium text-gray-500">Årgang</div>
                <div class="text-sm text-gray-900">{basicInfo.modelAar}</div>
                <div class="text-sm font-medium text-gray-500">Farve</div>
                <div
                  class="text-sm font-semibold {getColorClass(
                    basicInfo.farveTypeNavn,
                  )}"
                >
                  {basicInfo.farveTypeNavn}
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>
