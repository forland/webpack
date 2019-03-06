<template>
  <section v-if="errored">
    <p>Kunne desværre ikke hente oplysningerne lige nu - prøv venligst igen eller kom tilbage senere....</p>
    <b-button v-on:click="forceRerender" variant="primary">Prøv igen!</b-button>
  </section>
  <section v-else>
    <div class="container">
    <div class="row">
    <div class="col-sm"> 
    <template>
      <div>
        <treeselect
          :multiple="true"
          :options="options"
          :default-expand-level="1"
          :autoFocus="true"
          clearAllText="Slet alt"
          clearValueText="Slet"
          value-consists-of="LEAF_PRIORITY"
          :max-height=600
          :always-open="true"
          :limit="10"
          :limitText="count => `og ${count} flere`"
          noResultsText="Ingen hold passer til din søgning...."
          placeholder="Vælg dine hold...."
          v-model="value"
          />
      </div>
    </template>
    </div>
        <div class="col-sm">
      <pre class="result">{{ value }}</pre>
    </div>
  </div>
</div>
    <div class="gamestable">
        
        <div v-if="loading">
           <img src="../assets/oneBallRotating300x299.gif">
           <p>Vent - henter data...</p>
        </div>
        <div v-else>
 
        </div>
    </div>
  </section>
</template>

<script>
// import the component
import Treeselect from '@riophae/vue-treeselect';
// import the styles
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import { _ } from 'vue-underscore';
import axios from 'axios';

export default {
  name: 'LeaguesSelect',
  // register the component
  components: { Treeselect },
  data() {
    return {
      games: null,
      gamesPlayed: null,
      gamesNotPlayed: null,
      loading: true,
      errored: false,
      // define default value
      value: ['/forening/3108500/hold/151994', '/forening/0140300/hold/152224'],
      // define options
      options: [],
    };
  },
  mounted() {
    // AXIOS
    this.loadingInfo = true;
    const season = '2018-19';
    axios
    .get(`https://hyaj6jv380.execute-api.eu-west-1.amazonaws.com/prod/getLeagues/${season}`)
    .then((result) => {
      const resultData = _.sortBy(result.data, 'leagueName');
      const resultDataGRP = _.toArray(_.groupBy(resultData, 'leagueCategory'));

      const leaguesSelectArray = [];
      for (let i = 0; i < resultDataGRP.length; i += 1) {
        const childrenZ = [];
        for (let y = 0; y < resultDataGRP[i].length; y += 1) {
          const teams = resultDataGRP[i][y].teams;
          const children = [];

          for (let v = 0; v < teams.length; v += 1) {
            const id = teams[v].teamId;
            const label = teams[v].teamName;
            children.push({ id, label });
          }
          const id = resultDataGRP[i][y].leagueId;
          const label = resultDataGRP[i][y].leagueName;

          childrenZ.push({ id, label, children });
        }

        const id = resultDataGRP[i][0].leagueCategory;
        const label = resultDataGRP[i][0].leagueCategory;
        leaguesSelectArray.push({ id, label, children: childrenZ });
      }
      this.options = leaguesSelectArray;
    })
    .catch((error) => {
      console.log(error);
      this.infoErrored = true;
    })
    .finally(() => {
      this.loading = false;
    });
  },
  methods: {
  },
};
</script>

<style scoped>
    h1, h2 {
        font-weight: normal;
    }
</style>