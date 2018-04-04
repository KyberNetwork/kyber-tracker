<template>
  <div>
    <div class="panel panel-default">

      <div v-if="!!title" class="panel-heading">
        <h4 class="no-margin"> {{ title }} </h4>
      </div>

      <div class="table-responsive-wraper">
        <table class="table table-hover table-responsive table-round" responsive>
          <thead>
            <tr>
            <slot name="header"></slot>
            </tr>
          </thead>
          <thead>
            <tr>
            <slot name="filter"></slot>
            </tr>
          </thead>
          <tbody v-if="rows.length > 0">
            <slot name="body" v-for="(row, index) in rows" :item="row" :index="index"></slot>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script>

  export default {
    props: {
      getData: {
        type: Function,
      },
      getPrevious: {
        type: Function,
      },
      getNext: {
        type: Function,
      },
      title: {
        type: String,
      },
      pageSize: {
        type: Number,
      }
    },
    data() {
      return {
        rows: [],
        hasPreviousList: true,
        hasNextList: true,
      };
    },
    computed: {

    },
    methods: {
      fetch () {
        this.getData().then(data => {
          this.rows = data;
        });
      },
      fetchPrevious () {
        this.getPrevious().then(data => {
          if (!data || !data.length) {
            window.EventBus.$emit('EVENT_COMMON_MSG', 'No more previous data');
            this.hasPreviousList = false;
          } else {
            this.hasNextList = true;
            if (data.length < this.pageSize) {
              this.hasPreviousList = false;
            }
            this.rows = data;
          }
        });
      },
      fetchNext () {
        this.getNext().then(data => {
          if (!data || !data.length) {
            window.EventBus.$emit('EVENT_COMMON_MSG', 'No more next data');
            this.hasNextList = false;
          } else {
            this.hasPreviousList = true;
            if (data.length < this.pageSize) {
              this.hasNextList = false;
            }
            this.rows = data;
          }
        });
      }
    },
    created () {

    }
  };
</script>

<style scoped lang="css">
  .container {
    margin-top: 2em;
  }

  .panel {
    background: none !important;
  }

  .panel-heading {
    text-align: center !important;
    background-color: #f5f5f5 !important;
  }

  .action-block {
    display: inline-block;
  }

  .paginator {
    padding: 9px 14px;
    margin-bottom: 14px;
    background-color: #f7f7f9;
    border: 1px solid #e1e1e8;
    border-radius: 4px;
  }

  .indicator {
    cursor: pointer;
  }

  .indicator-prev {

  }

  .indicator-next {
    float: right;
  }

  .clearfix {
    clear: both;
    overflow: auto;
  }
</style>
