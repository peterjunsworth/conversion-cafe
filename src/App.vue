<template>
  <div id="app">
    <SiteNav v-if="showNav"></SiteNav>
    <router-view/>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import SiteNav from '@/components/SiteNav'

export default {
  components: {
    SiteNav
  },
  computed: {
    ...mapState(['userProfile']),
    showNav() {
      return Object.keys(this.userProfile).length > 1
    }
  }
}
</script>

<!-- <script src="/__/firebase/8.6.3/firebase-app.js"></script>
<script src="/__/firebase/8.6.3/firebase-analytics.js"></script>
<script src="/__/firebase/init.js"></script> -->
