import { reactive } from 'vue'

const store = reactive({
  isLogin: false,
  databases: [],
  currentDatabase: '',
  connectionConfig: {
    host: '',
    port: '',
    username: '',
    password: '',
    database: ''
  },        
  // 登录方法
  login() {
    this.isLogin = true
  },
  
  // 登出方法
  logout() {
    this.isLogin = false
    this.databases = []
  },
  
  // 添加数据库
  addDatabase(dbName) {
    if (!this.databases.includes(dbName)) {
      this.databases.push(dbName)
    }
  },
  
  // 清空数据库列表
  clearDatabases() {
    this.databases = []
  },

  // 选择数据库
  selectDatabase(dbName) {
    this.currentDatabase = dbName
  },

  saveConnectionConfig(config) {
    this.connectionConfig = config
  }
})

export default store