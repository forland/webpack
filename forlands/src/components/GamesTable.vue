<template>
  <b-container fluid>
    <!-- User Interface controls -->
    <h3>{{ title }}</h3>
    <b-row>
      <b-col md="6" class="my-1">
        <b-form-group horizontal label="Filter" class="mb-0">
          <b-input-group>
            <b-form-input v-model="filter" placeholder="Søg efter...." />
            <b-input-group-append>
              <b-btn :disabled="!filter" @click="filter = ''">Clear</b-btn>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col md="6" class="my-1">
        <b-form-group horizontal label="Pr. side" class="mb-0">
          <b-form-select :options="pageOptions" v-model="perPage" />
        </b-form-group>
      </b-col>
    </b-row>
    <!-- Main table element -->
    <b-table :striped="striped"
             responsive
             show-empty
             stacked="md"
             :items="items"
             :fields="fields"
             :current-page="currentPage"
             :per-page="perPage"
             :filter="filter"
             :sort-by.sync="sortBy"
             :sort-desc.sync="sortDesc"
             :sort-direction="sortDirection"
             @filtered="onFiltered"
    >
      <template slot="detaljer" slot-scope="row">
        <!-- We use @click.stop here to prevent a 'row-clicked' event from also happening -->
        <b-form-checkbox @click.native.stop @change="row.toggleDetails" v-model="row.detailsShowing">
          ...
        </b-form-checkbox>
      </template>
      <template slot="gameDateTxt" slot-scope="row">
             {{row.item.gameDateTxt}} <small>{{row.item.gameTime}}</small>
             </template>
      <template slot="homeTeam" slot-scope="row">
             <a :href="`https://minidraet.dgi.dk/${row.item.homeTeamUrl}`">{{row.item.homeTeam}}</a>
             </template>
      <template slot="awayTeam" slot-scope="row">
             <a :href="`https://minidraet.dgi.dk/${row.item.awayTeamUrl}`">{{row.item.awayTeam}}</a>
             </template>
      <template slot="stilling" slot-scope="row">
        <!-- We use @click.stop here to prevent a 'row-clicked' event from also happening -->
        <b-button size="sm" @click.stop="info(row.item, row.index, $event.target)" class="mr-1">
          Stilling
        </b-button>
      </template>
      <template slot="row-details" slot-scope="row">
        <b-card>
          <ul>
            <li v-for="(value, key) in row.item" :key="key">{{ key }}: {{ value}}</li>
          </ul>
        </b-card>
      </template>
    </b-table>

    <b-row>
      <b-col md="6" class="my-1">
        <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" class="my-0" />
      </b-col>
    </b-row>

    <!-- Info modal -->
    <b-modal v-bind:id="modalsID" @hide="resetModal" :title="modalInfo.title">
        <section v-if="modalErrored">
          <p>We're sorry, we're not able to retrieve this information at the moment, please try back later</p>
        </section>
        <section v-else>  
          <div v-if="loadingModal">....vent - henter stillingen</div>
          <Standings v-else v-bind:statsData="modalInfo.content"/>
        </section>
      <pre><a :href="`https://minidraet.dgi.dk/${modalInfo.pre}`">{{modalInfo.title}}</a></pre>
    </b-modal>
  </b-container>
  
</template>

<script>
import axios from 'axios';
import Standings from './Standings';

export default {
  components: { Standings },
  props: {
    games: {
      type: Array,
      required: true,
    },
    title: '',
    sortDescending: Boolean,
    colHideResult: '',
    modalsID: '',
  },
  data() {
    return {
      items: this.games,
      striped: true,
      fields: [
        { key: 'detaljer', label: '' },
        { key: 'gameDateTxt', label: 'Dato', sortable: false, class: 'text-center' },
        { key: 'raekke', label: 'Række', sortable: true, class: 'text-center' },
        { key: 'homeTeam', label: 'Hjemme', sortable: false, class: 'text-center' },
        { key: 'awayTeam', label: 'Ude', sortable: false, class: 'text-center' },
        { key: 'gameResult', label: 'Resultat', sortable: false, class: 'text-center', thClass: this.colHideResult, tdClass: this.colHideResult },
        { key: 'stilling', label: '' },
      ],
      currentPage: 1,
      perPage: 5,
      totalRows: this.games.length,
      pageOptions: [5, 10, 15, 20, 50, 100, 200],
      sortBy: 'gameDate',
      sortDesc: this.sortDescending,
      sortDirection: 'asc',
      filter: null,
      modalInfo: { title: '', content: [], pre: '' },
      loadingModal: false,
      modalErrored: false,
    };
  },
  computed: {
    sortOptions() {
      // Create an options list from our fields
      return this.fields
        .filter(f => f.sortable);
        // .map((f) => { return { text: f.label, value: f.key }; });
    },
  },
  methods: {
    info(item, index, button) {
      this.loadingModal = true;
      this.modalInfo.title = `${item.raekke} - ${item.pulje}`;
      this.modalInfo.pre = item.puljeUrl;
      this.$root.$emit('bv::show::modal', this.modalsID, button);
      const puljeUrlEndpoint = item.puljeUrl.replace(/\//g, '-');
    // AXIOS
      axios
      .get(`https://zbi1d4874m.execute-api.eu-west-1.amazonaws.com/dev/stats/${puljeUrlEndpoint}`)
      .then((result) => {
        this.modalInfo.content = result.data;
      })
      .catch((error) => {
        console.log(error);
        this.modalErrored = true;
      })
      .finally(() => {
        this.loadingModal = false;
      });
    },
    resetModal() {
      this.modalInfo.title = '';
      this.modalInfo.content = [];
      this.modalInfo.pre = '';
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
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
</style>