import Vue from 'vue';
import Router from 'vue-router';
import Hello from '@/components/Hello';
import FrontPage from '@/components/FrontPage';
import Carousel from '@/components/Carousel';
import Tables from '@/components/Tables';
import GetIp from '@/components/GetIp';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Tables',
      component: Tables,
    },
    {
      path: '/hello',
      name: 'Hello',
      component: Hello,
    },
    {
      path: '/getip',
      name: 'GetIp',
      component: GetIp,
    },
    {
      path: '/front',
      name: 'Front',
      component: FrontPage,
    },
    {
      path: '/carousel',
      name: 'Carousel',
      component: Carousel,
    },
  ],
});
