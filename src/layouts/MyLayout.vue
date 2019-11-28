<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          icon="settings"
          aria-label="Menu"
        />

        <q-toolbar-title>
          AttYoUno
        </q-toolbar-title>

        <div>
          MQTT:
          <span v-if="mqttClient.status == 'connected'">
            CONNESSO
          </span>
          <span v-else-if="mqttClient.status == 'connecting'">
            In connessione...
          </span>
          <span v-else>
            DISCONNESSO
          </span>
          <div class="inline-block text-right" style="width:2rem">
            <q-spinner color="deep-orange" size="1.5rem"
              v-if="mqttClient.status == 'connecting'"/>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      overlay
      elevated
      bordered
      content-class="bg-grey-2"
    >
      <q-list>
        <q-item-label header>Impostazioni</q-item-label>
        <q-item>
          <q-item-section>
            <q-input outlined
              v-model="mqttClient.host" label="Host Server MQTT (ws)"/>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-input outlined type="number"
              v-model.number="mqttClient.port" label="Porta MQTT (ws)"/>
          </q-item-section>
        </q-item>
        <q-item v-if="mqttClient.status != 'connected'">
          <q-item-section>
            <q-btn class="full-width" label="Connetti"
              :loading="mqttClient.status == 'connecting'"
              @click="mqttClient.connect" color="positive"/>
          </q-item-section>
        </q-item>
        <q-item v-if="mqttClient.status == 'connected'">
          <q-item-section>
            <q-btn class="full-width" label="Disconnetti"
              @click="mqttClient.disconnect" color="negative"/>
          </q-item-section>
        </q-item>
      </q-list>
      <q-item style="position:absolute;bottom:0;width:100%">
        <q-img class="q-ma-md"
          src="https://upload.wikimedia.org/wikipedia/it/thumb/2/27/Politecnico_di_Torino_-_Logo.svg/750px-Politecnico_di_Torino_-_Logo.svg.png"/>
      </q-item>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import mqttClient from '../logic/mqttClient';

export default {
  name: 'MyLayout',

  data() {
    return {
      leftDrawerOpen: false,
      mqttClient,
    };
  },
  mounted() {
    if (mqttClient.status === 'disconnected') {
      this.leftDrawerOpen = true;
    }
  },
};
</script>
