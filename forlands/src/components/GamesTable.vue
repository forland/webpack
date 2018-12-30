<template>
  <b-container fluid>
    <!-- User Interface controls -->
    <b-row>
      <b-col md="6" class="my-1">
        <b-form-group horizontal label="Filter" class="mb-0">
          <b-input-group>
            <b-form-input v-model="filter" placeholder="Type to Search" />
            <b-input-group-append>
              <b-btn :disabled="!filter" @click="filter = ''">Clear</b-btn>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col md="6" class="my-1">
        <b-form-group horizontal label="Per page" class="mb-0">
          <b-form-select :options="pageOptions" v-model="perPage" />
        </b-form-group>
      </b-col>
    </b-row>
    <b-form-checkbox v-model="striped">Striped</b-form-checkbox>
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
      <template slot="homeTeam" slot-scope="row">
             <a :href="`https://minidraet.dgi.dk/${row.item.homeTeamUrl}`">{{row.item.homeTeam}}</a>
             </template>
      <template slot="awayTeam" slot-scope="row">
             <a :href="`https://minidraet.dgi.dk/${row.item.awayTeamUrl}`">{{row.item.awayTeam}}</a>
             </template>
      <template slot="isActive" slot-scope="row">{{row.value?'Yes :)':'No :('}}</template>
      <template slot="actions" slot-scope="row">
        <!-- We use @click.stop here to prevent a 'row-clicked' event from also happening -->
        <b-button size="sm" @click.stop="info(row.item, row.index, $event.target)" class="mr-1">
          Info modal
        </b-button>
        <b-button size="sm" @click.stop="row.toggleDetails">
          {{ row.detailsShowing ? 'Hide' : 'Show' }} Details
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
    <b-modal id="modalInfo" @hide="resetModal" :title="modalInfo.title" ok-only>
      <pre>{{ modalInfo.content }}</pre>
    </b-modal>

  </b-container>
</template>

<script>
export default {
  props: {
    games: {
      type: Array,
      required: true,
    },
  },
  name: 'GamesTable',
  data() {
    return {
      items: this.games,
      striped: false,
      fields: [
        { key: 'gameNumber', label: 'Kamp #', sortable: true, sortDirection: 'asc' },
        { key: 'raekke', label: 'Række', sortable: true, class: 'text-center' },
        { key: 'gameDateTxt', label: 'Dato', sortable: true, class: 'text-center' },
        { key: 'homeTeam', label: 'Hjemme', sortable: true, class: 'text-center' },
        { key: 'awayTeam', label: 'Ude', sortable: true, class: 'text-center' },
        { key: 'gameResult', label: 'Resultat', sortable: true, class: 'text-center' },
        { key: 'isActive', label: 'is Active' },
        { key: 'actions', label: 'Actions' },
      ],
      currentPage: 1,
      perPage: 15,
      totalRows: this.games.length,
      pageOptions: [5, 10, 15, 20],
      sortBy: 'gameDate',
      sortDesc: true,
      sortDirection: 'asc',
      filter: null,
      modalInfo: { title: '', content: '' },
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
      this.modalInfo.title = `Row index: ${index}`;
      this.modalInfo.content = JSON.stringify(item, null, 2);
      this.$root.$emit('bv::show::modal', 'modalInfo', button);
    },
    resetModal() {
      this.modalInfo.title = '';
      this.modalInfo.content = '';
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
  },
};
</script>