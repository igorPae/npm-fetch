<template>
  <v-container>
    <v-text-field label="Search" v-model="key"></v-text-field>
    <v-btn
      class="tree_bt"
      small
      :loading="loading"
      color="primary"
      @click="onClick"
    >
      Click
    </v-btn>
    <v-spacer />
    <v-treeview :items="items" :load-children="loadChildren"></v-treeview>
  </v-container>
</template>
<script>
import axios from "axios";
export default {
  name: "RepoTree",
  props: {
    initKey: {
      type: String,
      required: false,
      default: ""
    }
  },
  data() {
    return {
      loading: false,
      key: this.initKey,
      items: []
    };
  },
  methods: {
    onClick() {
      console.log("clicked:", this.key);
      if (!this.key) return;
      this.loading = true;
      axios
        .get(`http://localhost:3000/express`)
        .then(response => {
          console.log("response:", response);
          this.loading = false;
          if (response.data === "not found") {
            this.items = [];
            return;
          }
          this.items = Object.entries(response.data).map(([name]) => {
            return {
              name,
              children: []
            };
          });
        })
        .catch(err => {
          console.log("err:", err);
          this.loading = false;
        });
    },
    loadChildren(node) {
      this.loading = true;
      axios
        .get(`http://localhost:3000/${node.name}`)
        .then(response => {
          this.loading = false;
          console.log("response:", response);
          this.loading = false;
          if (response.data === "not found") {
            this.items = [];
            return;
          }
          const children = Object.entries(response.data).map(([name]) => {
            return {
              name,
              children: []
            };
          });
          if (children.length < 1) {
            node.children = undefined;
          } else node.children = children;
        })
        .catch(err => {
          console.log("err:", err);
          this.loading = false;
        });
    }
  }
};
</script>
