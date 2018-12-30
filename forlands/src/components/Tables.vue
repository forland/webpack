<template>
  <section v-if="errored">
    <p>We're sorry, we're not able to retrieve this information at the moment, please try back later</p>
  </section>
  <section v-else>  
    <div class="gamestable">
        
        <div v-if="loading">Loading...</div>
        <GamesTable v-else v-bind:games="gamesPlayed"/>
        <div v-else v-for="game in games" class="games">{{ game.gameNumber }}</div>
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
    axios
      .get('https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/games/2148000-152407')
      .then((result) => {
        // console.log(result);
        this.ip = result.data[0].gameNumber;
        // this.games = result.data;
      })
      .catch((error) => {
        console.log(error);
        this.errored = true;
      });
    const linksArr = [
      'https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/games/2148000-152407',
      'https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/games/2148000-165378',
      'https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/games/2148000-152092',
      'https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/games/2148000-152093',
      'https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/games/2148000-152094',
      'https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/games/2148000-152097',
      'https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/games/2148000-152096',
    ];
    axios
      .all(linksArr.map(l => axios.get(l)))
      .then((results) => {
        const merged = results
        .map(r => r.data)
        .reduce((acc, item) => [...acc, ...item], []);
        // console.log(merged);
        this.games = merged;
        this.gamesNotPlayed = merged.filter(NotPlayed => NotPlayed.gameResult === '');
        this.gamesPlayed = merged.filter(played => played.gameResult !== '');
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