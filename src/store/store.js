import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
import AuthService from './../authentication/AuthService';

const auth = new AuthService();

Vue.use(Vuex)

// the root, initial state object
const state = {
  recipes: []
}

// define the possible mutations that can be applied to our state
const mutations = {
	clearRecipes (state) {
		state.recipes = [];
	},
	loadRecipes (state, recipes) {
		state.recipes = recipes;
	},
	addRecipe (state, recipe) {
		state.recipes.push(recipe);
	},
  updateRecipe (state, recipe) {
    const existingRecipe = state.recipes.find(x => x.id == recipe.id)
    state.recipes[state.recipes.indexOf(existingRecipe)] = recipe;
  },
  deleteRecipe (state, recipe) {
    const index = state.recipes.indexOf(recipe)
    if (index !== -1) {
      state.recipes.splice(index, 1)
    }
  }
}

const api = axios.create({
  baseURL: app_config.API_URL,
  headers: auth.getAuthHeader()
});

const actions = {
  addRecipe (context, recipe) {
    return api.post('recipes/add', recipe)
    .then((response) => {
      context.commit('addRecipe', recipe)
    })
  },
  updateRecipe (context, recipe) {
    return api.put(`recipes/${recipe.id}`, recipe)
    .then((response) => {
      context.commit('updateRecipe', recipe)
    })
  },
  deleteRecipe (context, recipe) {
    return api.delete(`recipes/${recipe.id}/delete`)
    .then(function (response) {
      context.commit('deleteRecipe', recipe)
    })
  },
  uploadImage (context, data) {
    return api.post(`recipes/${data.id}/image`, data.formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

const getters = {
  getRecipeById: (state) => (id) => {
    return state.recipes.find(x => x.id == id);
  }
}

// create the Vuex instance by combining the state and mutations objects
// then export the Vuex store for use by our components
export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,

  // use strict mode unless in the production environment,
  // where we want to avoid the performance cost
  strict: process.env.NODE_ENV !== 'production'
})
