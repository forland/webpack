import Vue from 'vue';
import Router from 'vue-router';
import Play from '@/components/Play';
import Carousel from '@/components/Carousel';
import Tables from '@/components/Tables';
import GetIp from '@/components/GetIp';
import GameInfo from '@/components/GameInfo';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/GameInfo',
      name: 'GameInfo',
      component: GameInfo,
    },
    {
      path: '/',
      name: 'Tables',
      component: Tables,
    },
    {
      path: '/getip',
      name: 'GetIp',
      component: GetIp,
    },
    {
      path: '/play',
      name: 'Play',
      component: Play,
    },
    {
      path: '/carousel',
      name: 'Carousel',
      component: Carousel,
    },
  ],
});
