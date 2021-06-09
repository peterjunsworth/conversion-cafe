<template>
  <div id="settings" class="container">
    <div class="row justify-content-md-center">
      <div class="col-6">
        <h3>Settings</h3>
        <p>Update your profile</p>

        <transition name="fade">
          <p v-if="showSuccess" class="success">profile updated</p>
        </transition>

        <form @submit.prevent>
          <label for="name">Name</label>
          <input v-model.trim="name" type="text" :placeholder="userProfile.name" id="name" />

          <label for="title">Job Title</label>
          <input v-model.trim="title" type="text" :placeholder="userProfile.title" id="title" />

          <button @click="updateProfile()" class="button">Update Profile</button>
        </form>
      </div>
    </div>

    <div class="row justify-content-md-center">
      <div class="col-6">
        <form @submit.prevent>
          <h1>Merchant Sign Up</h1>
          <div>
            <label for="name">Company Name</label>
            <input v-model.trim="merchantForm.name" type="text" placeholder="Company Name" id="name" />
          </div>
          <div>
            <label for="title">Api Key</label>
            <input v-model.trim="merchantForm.apiKey" type="text" placeholder="absde1234567890" id="apiKey" />
          </div>
          <div>
            <label for="email2">Password</label>
            <input v-model.trim="merchantForm.apiSecret" type="password" placeholder="**********" id="apiSecret" />
          </div>
          <button @click="merchantsignup()" class="button">Sign Up</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      name: '',
      title: '',
      showSuccess: false,
      merchantForm: {
        name: '',
        apiKey: '',
        apiSecret: ''
      }
    }
  },
  computed: {
    ...mapState(['userProfile'])
  },
  methods: {
    updateProfile() {
      this.$store.dispatch('updateProfile', {
        name: this.name !== '' ? this.name : this.userProfile.name,
        title: this.title !== '' ? this.title : this.userProfile.title
      })

      this.name = ''
      this.title = ''

      this.showSuccess = true

      setTimeout(() => {
        this.showSuccess = false
      }, 2000)
    },
    async merchantsignup() {
      await this.$store.dispatch('createMerchant', this.merchantForm)
    }
  }
}
</script>
