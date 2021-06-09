<template>
  <div id="dashboard">
    <transition name="fade">
      <CommentModal v-if="showCommentModal" :post="selectedPost" @close="toggleCommentModal()"></CommentModal>
    </transition>

    <form class="container">
      <div class="mb-3">
        <label for="bundleName" class="form-label">Bundle Name</label>
        <input type="text" v-model="bundle.name" class="form-control" id="bundleName" aria-describedby="bundleName">
      </div>
      <div class="mb-3">
        <label for="bundleDescription" class="form-label">Bundle Description</label>
        <textarea v-model="bundle.description" class="form-control" id="bundleDescription" rows="3"></textarea>
      </div>
      <div class="mb-3">
        <button v-if="bundle.products.length > 0" type="button" class="btn btn-info" @click="createBundle()">Create Bundle</button>
      </div>
    </form>

    <div class="container">
      <div class="row">
        <div class="col-4">
            <!-- <img :src="bundle.image" crossorigin="anonymous" width="200" height="200" alt="bundle images montage" /> -->
            <canvas id="canvas"></canvas>
        </div>
      </div>
    </div>

    <div class="container merchantNames">
      <label class="form-label">View Products By Merchant</label>
      <div class="row">
        <div v-for="merchant in merchants" :key="merchant.id" class="col-4">
          <button v-if="merchant.id !== activeMerchant" type="button" class="btn btn-info" @click="getProducts(merchant.id)">{{merchant.name}}</button>
          <button v-if="merchant.id === activeMerchant" type="button" class="btn btn-success">{{merchant.name}}</button>
        </div>
      </div>
    </div>

    <div v-if="products.length > 0" class="container">
      <div class="row">
        <div v-for="product in products" :key="product.id" class="col-4 bundle">
          <h6>{{product.title}}</h6>
          <img :src="product.image.src" width="200" height="auto" :alt="product.title" />
          <button v-if="!hasProductInBundle(product.id)" type="button" class="btn btn-info" @click="bundleProduct(product)">Add to Bundle</button>
          <button v-if="hasProductInBundle(product.id)" type="button" class="btn btn-success" @click="bundleProduct(product)">Remove from Bundle</button>
    </div>
      </div>
    </div>

    <div>
      <div class="col1">
        <div class="profile">
          <h5>{{ userProfile.name }}</h5>
          <p>{{ userProfile.title }}</p>
          <div class="create-post">
            <p>create a post</p>
            <form @submit.prevent>
              <textarea v-model.trim="post.content"></textarea>
              <button @click="createPost()" :disabled="post.content === ''" class="button">post</button>
            </form>
          </div>
        </div>
      </div>
      <div class="col2">
        <div v-if="posts.length">
          <div v-for="post in posts" :key="post.id" class="post">
            <h5>{{ post.userName }}</h5>
            <span>{{ post.createdOn | formatDate }}</span>
            <p>{{ post.content | trimLength }}</p>
            <ul>
              <li><a @click="toggleCommentModal(post)">comments {{ post.comments }}</a></li>
              <li><a @click="likePost(post.id, post.likes)">likes {{ post.likes }}</a></li>
              <li><a @click="viewPost(post)">view full post</a></li>
            </ul>
          </div>
        </div>
        <div v-else>
          <p class="no-results">There are currently no posts</p>
        </div>
      </div>
    </div>

    <!-- full post modal -->
    <transition name="fade">
      <div v-if="showPostModal" class="p-modal">
        <div class="p-container">
          <a @click="closePostModal()" class="close">close</a>
          <div class="post">
            <h5>{{ fullPost.userName }}</h5>
            <span>{{ fullPost.createdOn | formatDate }}</span>
            <p>{{ fullPost.content }}</p>
            <ul>
              <li><a>comments {{ fullPost.comments }}</a></li>
              <li><a>likes {{ fullPost.likes }}</a></li>
            </ul>
          </div>
          <div v-show="postComments.length" class="comments">
            <div v-for="comment in postComments" :key="comment.id" class="comment">
              <p>{{ comment.userName }}</p>
              <span>{{ comment.createdOn | formatDate }}</span>
              <p>{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { commentsCollection, merchantsCollection } from '@/firebase'
import Vue from 'vue'
import { mapState } from 'vuex'
import moment from 'moment'
import CommentModal from '@/components/CommentModal'
import axios from 'axios'
import * as firebase from 'firebase/app'
import AsyncComputed from 'vue-async-computed'
import mergeImages from 'merge-images'

Vue.use(AsyncComputed)

export default {
  components: {
    CommentModal
  },
  data() {
    return {
      post: {
        content: ''
      },
      showCommentModal: false,
      selectedPost: {},
      showPostModal: false,
      fullPost: {},
      postComments: [],
      products: [],
      bundle: {
        name: '',
        description: '',
        image: '',
        products: []
      },
      activeMerchant: null
    }
  },
  asyncComputed: {
    async merchants() {
      const merchants = await merchantsCollection.get()
      let merchantData = []

      merchants.forEach(merchant => {
        if (merchant.data().name) {
        const data = merchant.data();
        data.id = merchant.id;
        merchantData.push(data)
      }
    })
    return merchantData
  }
  },
  computed: {
    ...mapState(['userProfile', 'posts']),
  },
  methods: {
    createPost() {
      this.$store.dispatch('createPost', { content: this.post.content })
      this.post.content = ''
    },
    toggleCommentModal(post) {
      this.showCommentModal = !this.showCommentModal

      // if opening modal set selectedPost, else clear
      if (this.showCommentModal) {
        this.selectedPost = post
      } else {
        this.selectedPost = {}
      }
    },
    likePost(id, likesCount) {
      this.$store.dispatch('likePost', { id, likesCount })
    },
    async viewPost(post) {
      const docs = await commentsCollection.where('postId', '==', post.id).get()

      docs.forEach(doc => {
        let comment = doc.data()
        comment.id = doc.id
        this.postComments.push(comment)
      })

      this.fullPost = post
      this.showPostModal = true
    },
    closePostModal() {
      this.postComments = []
      this.showPostModal = false
    },
    getProducts(merchantId) {
      this.activeMerchant = merchantId;
      firebase.auth().currentUser.getIdToken()
          .then((authToken) => {
        const myUID = 'NieisdIC5dTWMTzWDijlcgZBsvH2';
        const notMyUID = 'some-other-uid';

        axios.get('https://us-central1-conversion-cafe.cloudfunctions.net/getProducts', {
          params: {
            merchantId: merchantId
          },
          headers : {
            'Authorization': 'Bearer ' + authToken
          }
        })
        .then(response => {
          // JSON responses are automatically parsed.
          this.products = response.data?.message?.products
        }).catch((err) => {
          console.log(err)
        });
      });
    },
    bundleProduct(product) {
      let productFound = false;
      for (let i = 0; i < this.bundle.products.length; i++) {
        if (this.bundle.products[i].id === product.id) {
          this.bundle.products.splice(i, 1);
          productFound = true;
        }
      }
      if(!productFound){
        this.bundle.products.push(product);
      }
    },
    hasProductInBundle(productId) {
      const products = this.bundle.products.filter(function(product){
        return (product.id === productId)
      });
      return products.length > 0;
    },
    createBundle() {
      const canvas = document.getElementById('canvas');
      const context = canvas.getContext('2d');

      canvas.width = 200;
      canvas.height = 200;

      let productImages = [];
      for (let i = 0; i < this.bundle.products.length; i++) {
        const productImage = new Image();
        productImage.onload = function () {
          context.drawImage(productImage, (i % 2)*100, Math.floor(i/2)*100, 100, 100);
        }.bind(i);
        productImage.src = this.bundle.products[i].image.src;
      }
    }
  },
  filters: {
    formatDate(val) {
      if (!val) { return '-' }

      let date = val.toDate()
      return moment(date).fromNow()
    },
    trimLength(val) {
      if (val.length < 200) { return val }
      return `${val.substring(0, 200)}...`
    }
  },
  created() {

  }
}
</script>

<style lang="scss" scoped>

</style>
