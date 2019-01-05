<template>
    <section v-if="infoErrored">
    <p>Kunne desværre ikke hente oplysningerne lige nu - prøv venligst igen eller senere....</p>
  </section>
  <b-container v-else class="gameInfo">
    <b-row>
        <b-col>
          <b-list-group>
            <b-list-group-item class="d-flex justify-content-between align-items-center">
              Kampnummer
              <b-badge variant="primary" pill> {{ gameNumber }}</b-badge>
            </b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center">
              Spillerunde
              <b-badge variant="primary" pill> {{ gameRound }}</b-badge>
            </b-list-group-item>
          </b-list-group>
        </b-col>
        <b-col cols="12" md="auto">
          <div v-if="loadingInfo">Henter data...</div>
          <div v-else>
            <b-button v-if="gameRapportUrl" size="sm" :variant="primary" :href="gameRapportUrl">Hent<br>rapport</b-button>    
          </div>
        </b-col>
        <b-col>
          <b-list-group>
            <b-list-group-item class="d-flex justify-content-between align-items-center">
              Spillested 
              <b-badge variant="primary" pill> {{ gameLocation }}</b-badge>
            </b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center">
              Dommer(e) 
              <b-badge variant="primary" pill> {{ gameReferees }}</b-badge>
            </b-list-group-item>
          </b-list-group>
        </b-col>
    </b-row>
  </b-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'GameInfo',
  props: {
    gameInfoUrl: '',
  },
  data() {
    return {
      ip: '',
      infoErrored: false,
      loadingInfo: false,
      gameNumber: '',
      gameLocation: '',
      gameLocationUrl: '',
      gameReferees: '',
      gameRound: '',
      gameRapportUrl: '',
    };
  },
  mounted() {
    // AXIOS
    this.loadingInfo = true;
    const infoUrlEndpoint = this.gameInfoUrl.replace(/\//g, '-');
    axios
    .get(`https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/gameinfo/${infoUrlEndpoint}`)
    .then((result) => {
      this.gameNumber = result.data[0].gameNumber;
      this.gameLocation = result.data[0].gameLocationHead;
      if (result.data[0].gameLocationSub) {
        this.gameLocation = `${result.data[0].gameLocationHead} - ${result.data[0].gameLocationSub}`;
      }
      this.gameLocationUrl = result.data[0].gameLocationUrl;
      this.gameReferees = result.data[0].gameReferees;
      this.gameRound = result.data[0].gameRound;
      this.gameRapportUrl = result.data[0].gameRapportUrl;
    })
    .catch((error) => {
      console.log(error);
      this.infoErrored = true;
    })
    .finally(() => {
      this.loadingInfo = false;
    });
  },
  methods: {
  },
};
</script>

<style scoped>
    .btn {
        background-color: #007bff;
    }
</style>