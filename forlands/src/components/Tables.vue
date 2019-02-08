<template>
  <section v-if="errored">
    <p>Kunne desværre ikke hente oplysningerne lige nu - prøv venligst igen eller kom tilbage senere....</p>
    <b-button v-on:click="forceRerender" variant="primary">Prøv igen!</b-button>
  </section>
  <section v-else>  
    <div class="gamestable">
        
        <div v-if="loading">
           <img src="../assets/oneBallRotating300x299.gif">
           <p>Vent - henter data...</p>
        </div>
        <div v-else>
          <GamesTable v-bind:games="gamesNotPlayed" title="Kommende kampe" colHideResult="d-none" modalsID="played"/>
          <GamesTable v-bind:games="gamesPlayed" title="Resultater" sortDescending modalsID="notPlayed"/>
          <!--<div v-for="game in games" class="games">{{ game.gameNumber }}</div>-->
        </div>
    </div>
  </section>
</template>

<script>
import axios from 'axios';
import GamesTable from './GamesTable';


export default {
  name: 'Tables',
  components: { GamesTable },
  data() {
    return {
      games: null,
      gamesPlayed: null,
      gamesNotPlayed: null,
      loading: true,
      errored: false,
    };
  },
  mounted() {
    const linksArr = [
      'https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/games/-forening-2148000-hold-152407', // grundspil damer
      'https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/games/-forening-2148000-hold-165378', // mellemspil damer
      'https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/games/-forening-2148000-hold-152092', // Hafnia 1. div
      'https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/games/-forening-2148000-hold-152093', // Hafnia 3. div
      'https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/games/-forening-2148000-hold-152094', // Hafnia Serie 1
      'https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/games/-forening-2148000-hold-152097', // Hafnia U11 flex
      'https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/games/-forening-2148000-hold-152096', // Hafnia U13 flex
      'https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/games/-forening-1850800-Hold-153081', // JP piger
      'https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/games/-forening-1850800-Hold-152069', // JP U11 flex
      'https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/games/-forening-1850800-Hold-152071', // JP 2.div damer
    ];
    axios
      .all(linksArr.map(l => axios.get(l)))
      .then((results) => {
        const merged = results
        .map(r => r.data)
        .reduce((acc, item) => [...acc, ...item], []);
        this.games = merged;
        this.gamesNotPlayed = merged.filter(NotPlayed => NotPlayed.gameResult === '');
        this.gamesPlayed = merged.filter(played => played.gameResult !== '');
      })
      .catch((error) => {
        console.log(error);
        this.errored = true;
      })
      .finally(() => {
        this.loading = false;
      });
  },
  methods: {
    forceRerender() {
      // this.errored = false;
      // this.loading = true;
      // this.componentKey += 1;
      this.$forceUpdate();
      // alert(this.componentKey);
    },
  },
};
</script>

<style scoped>
    h1, h2 {
        font-weight: normal;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        display: inline-block;
        margin: 0 10px;
    }

    a {
        color: #42b983;
    }

    textarea {
        width: 600px;
        height: 200px;
    }
</style>