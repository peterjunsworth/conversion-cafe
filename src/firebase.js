import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

// firebase init
const firebaseConfig = {
  apiKey: "AIzaSyClApcQl3OCABm2UZQig9lRBJTglk2t2JQ",
  authDomain: "conversion-cafe.firebaseapp.com",
  projectId: "conversion-cafe",
  storageBucket: "conversion-cafe.appspot.com",
  messagingSenderId: "366104061574",
  appId: "1:366104061574:web:f532fd6d0f37792b7e5307",
  measurementId: "G-VX8NPXH1GW"
}
firebase.initializeApp(firebaseConfig)

// utils
const db = firebase.firestore()
const auth = firebase.auth()

// collection references
const usersCollection = db.collection('users')
const postsCollection = db.collection('posts')
const commentsCollection = db.collection('comments')
const likesCollection = db.collection('likes')

// export utils/refs
export {
  db,
  auth,
  usersCollection,
  postsCollection,
  commentsCollection,
  likesCollection
}
