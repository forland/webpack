<template>
  <b-table  show-empty 
            responsive 
            :items="items" 
            :fields="fields">
  <template slot="W-U-T" slot-scope="row">{{row.item.gamesWon}}/{{row.item.gamesDraw}}/{{row.item.gamesLost}}</template>
  </b-table>
</template>

<script>
export default {
  props: {
    statsData: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      items: this.statsData,
      fields: [
        { key: 'teamPosition', label: '' },
        { key: 'team', label: '' },
        { key: 'playedGames', label: 'Kampe' },
        { key: 'W-U-T', label: 'W/T/U' },
        { key: 'gamesScore', label: 'Score' },
        { key: 'gamesPoint', label: 'P' },
      ],
    };
  },
  methods: {
  },
};
</script>

<!-- Add "scoped " attribute to limit CSS to this component only -->
<style scoped>

</style>
