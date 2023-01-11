import "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js";
import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
import { apiUrl, apiPath } from "./config.js";

let productModal = null;
let delProductModal = null;

const app = createApp({
  data() {
    return {
      apiUrl,
      apiPath,
      products: [],
      tempProduct: {
        imagesUrl: [],
      },
      isNew: false,
      pagination: {},
    };
  },
  methods: {
    checkAdmin() {
      const url = `${this.apiUrl}/api/user/check`;
      axios
        .post(url)
        .then(() => {
          // 驗證成功，取得產品資料
          this.getProducts();
        })
        .catch((err) => {
          alert(err.response.data.message);
          // 若驗證失敗，則導回登入頁面
          window.location = "login.html";
        });
    },
    getProducts(page = 1) {
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/products?page=${page}`;
      axios
        .get(url)
        .then((res) => {
          const { products, pagination } = res.data;
          this.products = products;
          this.pagination = pagination;
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },
    openModal(isNew, item) {
      switch (isNew) {
        case "new":
          this.tempProduct = { imagesUrl: [] };
          this.isNew = true;
          productModal.show();
          break;
        case "edit":
          this.tempProduct = { ...item };
          this.isNew = false;
          productModal.show();
          break;
        case "delete":
          this.tempProduct = { ...item };
          delProductModal.show();
          break;
      }
    },
  },
  mounted() {
    // 取出 Token，並放入 axios 的預設配置中
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
    axios.defaults.headers.common.Authorization = token;

    this.checkAdmin();
  },
});

// 分頁元件
app.component("pagination", {
  template: "#pagination", // 使用 id 綁定模板的方法
  props: ["pages"], // 將外層資料傳遞到內層
  methods: {
    emitPages(item) {
      this.$emit("emit-pages", item); // 透過 emit 方法將內層元件資料傳遞到外層元件
    },
  },
});

// 新增/編輯
app.component("productModal", {
  template: "#productModal",
  props: ["product", "isNew"],
  data() {
    return {
      apiUrl,
      apiPath,
    };
  },
  methods: {
    updateProduct() {
      let url = `${this.apiUrl}/api/${this.apiPath}/admin/product`;
      let http = "post";
      // 透過 isNew 判斷是新增或編輯產品
      if (!this.isNew) {
        url = `${url}/${this.product.id}`;
        http = "put";
      }

      axios[http](url, { data: this.product })
        .then((res) => {
          alert(res.data.message);
          this.hideModal();
          this.$emit("update");
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },
    createImages() {
      this.product.imagesUrl = [];
      this.product.imagesUrl.push("");
    },
    openModal() {
      productModal.show();
    },
    hideModal() {
      productModal.hide();
    },
  },
  mounted() {
    productModal = new bootstrap.Modal(
      document.getElementById("productModal"),
      {
        keyboard: false,
      }
    );
  },
});

// 刪除
app.component("delProductModal", {
  template: "#delProductModal",
  props: ["item"],
  data() {
    return {
      apiUrl,
      apiPath,
    };
  },
  methods: {
    delProduct() {
      axios
        .delete(
          `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.item.id}`
        )
        .then((res) => {
          this.hideModal();
          this.$emit("update");
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },
    openModal() {
      delProductModal.show();
    },
    hideModal() {
      delProductModal.hide();
    },
  },
  mounted() {
    delProductModal = new bootstrap.Modal(
      document.getElementById("delProductModal"),
      {
        keyboard: false,
      }
    );
  },
});

app.mount("#app");
