export default class Store {

  get(key){
    window.localStorage.getItem(key)
  }

  set(key, value){
    window.localStorage.setItem(key, value)
  }
}