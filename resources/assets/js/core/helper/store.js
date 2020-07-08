
export default {
  get : function(key){
    // return JSON.parse(localStorage.getItem(key))
    return false
  },

  set : function(key, value){
    localStorage.setItem(key,JSON.stringify(value))
  }
}