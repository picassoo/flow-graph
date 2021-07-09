import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import Editor from '../components/Editor.vue'
import CustomEditor from '../components/CustomEditor.vue'

Vue.use(Router)

export default new Router({
    routes: [
        { path: '/home', component: HelloWorld },
        { path: '/editor', component: Editor },
        { path: '/custom/editor', component: CustomEditor },
    ]
})
