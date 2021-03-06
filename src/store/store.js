import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

// const auth = new AuthService()

Vue.use(Vuex)

// the root, initial state object
const state = {
  recipes: [],
  shoppingListIds: [],
  shoppingList: [],
  shoppingListTitles: [],

  // the recipe being viewed or edited
  currentRecipe: {},

  // the total number of recipes that match the search criteria
  resultCount: null,

  // Flag to indicate that we should reload recipes from the API. This is set to
  // true when a recipe is added, update or deleted to ensure the latest data is
  // shown, then set back to false after the recipes have been reloaded.
  refreshRecipes: true,

  // Before navigating to a route, the name of the route is added to this array.
  // This is used for more advanced navigation e.g. deciding where the back
  // button on the view recipe page should go to as there are three pages that
  // can route to that page.
  routeHistory: []
}

// define the possible mutations that can be applied to our state
const mutations = {
  clearRecipes (state) {
    state.recipes = []
  },
  loadRecipes (state, data) {
    state.recipes = data.recipes
    state.resultCount = parseInt(data.count)
    state.refreshRecipes = false
  },
  setCurrentRecipe (state, recipe) {
    state.currentRecipe = recipe
  },
  // reload recipes from the API next time we browse to Shared Recipes or
  // My Recipes
  recipesShouldReload (state) {
    state.refreshRecipes = true
  },
  logRouteVisit (state, routeName) {
    state.routeHistory.push(routeName)
  },
  toggleShoppingListRecipeIds (state, id) {
    state.shoppingListIds.includes(id)
      ? state.shoppingListIds = state.shoppingListIds.filter(e => e !== id)
      : state.shoppingListIds.push(id)
  },
  setShoppingListRecipes (state, ids) {
    state.shoppingListIds = ids
  },
  setShoppingListIngredients (state, ingredients) {
    state.shoppingList = ingredients
  },
  setShoppingListRecipeTitles (state, recipeTitles) {
    state.shoppingListTitles = recipeTitles
  }

}

const api = axios.create({
  baseURL: app_config.API_URL
})

// The object to be passed as a header for authenticated requests
function getAuthHeader () {
  return { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') }
}

const actions = {
  loadAllRecipes (context, params) {
    return api.get('recipes/all', {
      params: {
        'startPage': params.startPage,
        'pageSize': params.pageSize
      }
    })
    .then((response) => {
      context.commit('loadRecipes', response.data)
    })
  },

  loadMyRecipes (context, recipe) {
    return api.get('recipes/my-recipes', {
      headers: getAuthHeader()
    })
    .then((response) => {
      context.commit('loadRecipes', response.data)
    })
  },

  loadRecipe (context, id) {
    return api.get(`recipes/${id}`)
    .then((response) => {
      context.commit('setCurrentRecipe', response.data)
    })
  },

  searchAllRecipes (context, params) {
    return api.get('recipes/all/search', {
      params: {
        'searchTerm': params.searchTerm,
        'startPage': params.startPage,
        'pageSize': params.pageSize
      }
    })
    .then((response) => {
      context.commit('loadRecipes', response.data)
    })
  },

  addRecipe (context, recipe) {
    return api.post('recipes/add', recipe, {
      headers: getAuthHeader()
    })
    .then(() => {
      context.commit('recipesShouldReload')
    })
  },

  updateRecipe (context, recipe) {
    return api.put(`recipes/${recipe.id}`, recipe, {
      headers: getAuthHeader()
    })
    .then(() => {
      context.commit('recipesShouldReload')
    })
  },

  deleteRecipe (context, recipe) {
    return api.delete(`recipes/${recipe.id}/delete`, {
      headers: getAuthHeader()
    })
    .then(() => {
      context.commit('recipesShouldReload')
    })
  },

  uploadImage (context, data) {
    let headers = getAuthHeader()
    headers['Content-Type'] = 'multipart/form-data'
    return api.post(`upload-image`, data.formData, {
      headers: headers
    })
  },
  toggleShoppingListRecipeIds (context, id) {
    context.commit('toggleShoppingListRecipeIds', id)
    window.localStorage.setItem('ids', JSON.stringify(context.state.shoppingListIds))
  },
  getShoppingListIngredients (context) {
    if (context.state.shoppingListIds.length > 0) {
      api.get('shopping-list/' + context.state.shoppingListIds.join() )
        .then((response) => {
          context.commit('setShoppingListIngredients', response.data.ingredients)
          context.commit('setShoppingListRecipeTitles', response.data.titles)
      })
    }
    else {
      context.commit('setShoppingListIngredients', [])
      context.commit('setShoppingListRecipeTitles', [])
    }
  },
  getShoppingListRecipesFromStorage (context) {
    let storedIds = window.localStorage.getItem('ids')
    let ids = storedIds ? JSON.parse(storedIds) : []
    context.commit('setShoppingListRecipes', ids)
  }
}

const getters = {
  getRecipeById: (state) => (id) => {
    return state.recipes.find(x => x.id === parseInt(id))
  }
}

// create the Vuex instance by combining the state and mutations objects
// then export the Vuex store for use by our components
const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters,

  // use strict mode unless in the production environment,
  // where we want to avoid the performance cost
  strict: process.env.NODE_ENV !== 'production'
})

export default store
