<template>
  <div class="notfound-wrapper row w-100 text-center">
    <div class="col pb-4">
      <img class="notfound-img" src="/images/oop.png" />
    </div>
    <div class="col">
      <!-- {{notFoundString}} -->
      <div v-if="notFoundString" class="notfound-note pb-4">
        {{notFoundString}}
      </div>
      <div v-else class="notfound-note pb-4">
        The page you're looking for can't be found
      </div>
      <div class="go-home">
        <a href="/">
          <button type="button" class="btn btn-link">Back to home page</button>
        </a>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  props: {
    notFoundString: {
      type: String,
    },
  },
  data() {
    return {
      // chartInstance: undefined
    };
  },
  methods: {
  }
}
</script>