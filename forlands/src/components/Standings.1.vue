<template>
  <b-table  id="statsTable" 
            responsive 
            :busy.sync="isBusy" 
            :items="getStats" 
            :fields="fields" 
            :apiUrl="apiUrl"
            caption-top>
    <template slot="table-caption">
      <div v-if="this.isBusy">....vent - henter data</div>
      <div>inside: {{this.puljeUrlen}}</div>
    </template>
  <template slot="W-U-T" slot-scope="row">{{row.item.gamesWon}} - {{row.item.gamesDraw}} - {{row.item.gamesLost}}</template>
  </b-table>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    puljeUrlen: {
      default: '-turnering-32794-Raekke-90473-Pulje-33647',
    },
  },
  data() {
    return {
      isBusy: false,
      apiUrl: this.puljeUrl,
      fields: [
        { key: 'teamPosition', label: '' },
        { key: 'team', label: '' },
        { key: 'playedGames', label: 'Kampe' },
        { key: 'W-U-T', label: 'W - T - U' },
        { key: 'gamesScore', label: 'Score' },
        { key: 'gamesPoint', label: 'P' },
      ],
    };
  },
  mounted() {
    console.log(`tt: ${this.puljeUrlen}`);
  },
  methods: {
    getStats(ctx) {
        // Here we don't set isBusy prop, so busy state will be handled by table itself
        // this.isBusy = true
      console.log(ctx);
      console.log(`cc: ${this.puljeUrlen}`);
      // this.puljeUrl.replace(/turn/g, '-');
      // console.log(ctx);
      // const promise = axios.get(`https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/stats/${this.puljeUrl}`);
      const promise = axios.get('https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/stats/-turnering-32794-Raekke-90473-Pulje-33647');
      return promise.then((response) => {
        const items = response.data;
        // Here we could override the busy state, setting isBusy to false
        this.isBusy = false;
        return (items);
      }).catch((error) => {
        console.log(error);
        // Here we could override the busy state, setting isBusy to false
        this.isBusy = false;
        // Returning an empty array, allows table to correctly handle busy state in case of error
        return [];
      });
    },
  },
};
</script>

<!-- Add "scoped " attribute to limit CSS to this component only -->
<style scoped>

</style>
