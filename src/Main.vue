<template>
  <div style="padding: 5px;">
    <el-splitter>
      <el-splitter-panel size="200px" max="50%" min="200px">
        <div style="padding-right: 5px;">
          <div>
            <div style="width: 100%;">
              <el-select v-model="selectedDatabase" placeholder="请选择数据库" filterable
                style="width: calc(100% - 30px); margin-top: 1px;" clearable>
                <el-option v-for="database in databases" :key="database" :label="database" :value="database" />
              </el-select>
              <el-button type="text" @click="beginCreateDatabase" style="width: 30px;">
                <img :src="newDbImage" style="width: 20px; height: 20px;" />
              </el-button>
              <el-button type="text" v-if="canDeleteDatabase" @click="deleteDatabase" style="margin-left: 0px; color: red">删除该数据库</el-button>
            </div>
            <div v-if="selectedDatabase">
              <el-input v-model="filterTable" placeholder="请输入关键字进行表过滤"
                style="width: calc(100% - 40px); margin-top: 10px;" clearable size="small" />
              <el-button type="text" @click="beginCreateTable" style="width: 40px; margin-top:10px;">
                <img :src="newTableImage" style="width: 20px; height: 20px;" />
              </el-button>
            </div>
          </div>
          <div style="background-color: #eee; padding: 3px; margin-top: 1px;">
            <div style="font-size: 14px; margin-top: 5px; margin-left: 7px; color: #999;">表与视图：</div>
            <el-menu v-if="selectedDatabase" style="margin-left: -12px; background-color: #eee;">
              <el-menu-item v-for="table in showTables" :key="table.name" :index="table.name" style="height: 35px;"
                @click="selectTable(table.name)">{{ table.name }}</el-menu-item>
            </el-menu>
            <div v-else style="height: 100vh; display: flex; justify-content: center; align-items: center;">
              <el-empty description="请选择数据库" />
            </div>
          </div>
        </div>
      </el-splitter-panel>
      <el-splitter-panel>
        <div style="flex: 1; margin-left: 5px;">
          <el-tabs v-model="selectedTab" type="card" editable @edit="handleEditTab">
            <el-tab-pane v-if="selectedTable" :label="selectedTable" :name="selectedTable">
              <div>
                <el-input v-model="tableWhereCondition" placeholder="查询条件"></el-input>
              </div>
              <el-row>
                <el-col :span="20">
                  <div style="margin-top: 20px; font-size: 14px; color: #999;">查询到{{ tableData.length }}结果,如下：</div>
                </el-col>
                <el-col :span="4">
                  <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
                    <el-button type="primary" @click="queryTable(selectedTable, tableWhereCondition)">查询</el-button>
                  </div>
                </el-col>
              </el-row>
              <div style="height: 100vh">
                <el-auto-resizer>
                  <template #default="{ height, width }">
                    <el-table-v2 :data="tableData" :width="width" :height="height" :columns="tableColumns"
                      fixed></el-table-v2>
                  </template>
                </el-auto-resizer>
              </div>
            </el-tab-pane>
            <el-tab-pane v-for="query in moreQuerys" :key="query.name" :label="query.name" :name="query.name">
              <el-input v-model="query.sql" type="textarea" :rows="3" />
              <el-row>
                <el-col :span="20">
                  <div v-if="query.queryed" style="margin-top: 20px; font-size: 14px; color: #999;">
                    查询到{{ query.result.length }}结果,如下：
                  </div>
                </el-col>
                <el-col :span="4">
                  <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
                    <el-button type="primary" @click="querySql(query)">查询</el-button>
                  </div>
                </el-col>
              </el-row>
              <div style="height: 100vh">
                <el-auto-resizer>
                  <template #default="{ height, width }">
                    <el-table-v2 :data="query.result" :width="width" :height="height" :columns="query.resultColumns"
                      fixed></el-table-v2>
                  </template>
                </el-auto-resizer>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-splitter-panel>
    </el-splitter>
    <el-dialog v-model="showCreateDatabaseModal" title="新建数据库" width="30%">
      <el-input v-model="newDatabaseName" placeholder="请输入数据库名称" />
      <template #footer>
        <el-button @click="showCreateDatabaseModal = false">取消</el-button>
        <el-button type="primary" @click="createDatabase">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="showCreateTableModal" title="新建表" width="30%">
      <el-input v-model="newTableName" placeholder="请输入表名称" />
      <template #footer>
        <el-button @click="showCreateTableModal = false">取消</el-button>
        <el-button type="primary" @click="createTable">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import store from './store';
import { ref } from 'vue';
const databases = ref(store.databases);
import newDbImage from './Main/assets/images/new_db.jpeg';
import newTableImage from './Main/assets/images/new_table.png'
export default {
  name: 'Main',
  data() {
    return {
      tables: [],
      selectedDatabase: '',
      tableColumns: [],
      tableData: [],
      selectedTable: '',
      moreQuerys: [],
      selectedTab: '',
      filterTable: '',
      tableWhereCondition: '',
      showCreateDatabaseModal: false,
      showCreateTableModal: false,
      newDatabaseName: '',
      newTableName: '',
      newDbImage: newDbImage,
      newTableImage: newTableImage
    }
  },
  computed: {
    databases() {
      return store.databases;
    },
    showTables() {
      if (!this.filterTable) return this.tables;
      return this.tables.filter(table => table.name.includes(this.filterTable));
    },
    canDeleteDatabase() {
      let systemDatabases = ['sys', 'mysql', 'information_schema', 'performance_schema'];
      return !systemDatabases.includes(this.selectedDatabase) && this.selectedDatabase;
    }
  },
  watch: {
    selectedDatabase: {
      handler(newVal) {
        if (!newVal) {
          this.selectedTable = '';
          return;
        }
        this.filterTable = '';
        this.selectDatabase(newVal);
      },
      immediate: true
    }
  },
  methods: {
    beginCreateDatabase() {
      this.showCreateDatabaseModal = true;
      console.log("beginCreateDatabase");
    },
    beginCreateTable() {
      console.log("beginCreateTable");
      this.showCreateTableModal = true;
    },
    async createDatabase() {
      console.log("createDatabase", this.newDatabaseName);
      if (!this.newDatabaseName) {
        this.$message.error('请输入数据库名称');
        return;
      }
      if (this.databases.includes(this.newDatabaseName)) {
        this.$message.error('数据库已存在');
        return;
      }
      let resutl = await window.api.createDatabase(this.newDatabaseName);
      if (resutl.error) {
        this.$message.error(resutl.message);
        return;
      }
      this.showCreateDatabaseModal = false;
      this.$message.success('创建数据库成功');
      store.addDatabase(this.newDatabaseName)
      this.newDatabaseName = '';
    },
    createTable() {
      console.log("createTable", this.newTableName);
      if (!this.newTableName) {
        this.$message.error('请输入表名称');
        return;
      }
    },
    handleEditTab(targetName, action) {
      console.log("handleEditTab", targetName, action);
      if (action === 'remove') {
        this.moreQuerys = this.moreQuerys.filter(query => query.name !== targetName);
        if (this.selectedTable === targetName) {
          this.selectedTable = '';
        }
      }
      if (action === 'add') {
        this.addMoreQuery();
      }
    },
    async querySql(query) {
      console.log("querySql", query);
      const result = await window.api.queryDatabase(query.sql, []);
      console.log("result", result);
      if (result.error) {
        this.$message.error(result.message);
        return;
      }
      query.queryed = true;
      query.result = result;
      if (result.length > 0) {
        let queryResultColumns = [];
        let resultColumns = Object.keys(result[0]);
        for (let i = 0; i < resultColumns.length; i++) {
          let column = {
            title: resultColumns[i],
            key: resultColumns[i],
            dataKey: resultColumns[i],
            width: 100,
            sortable: true
          }
          queryResultColumns.push(column)
        }
        query.resultColumns = queryResultColumns;
      }
    },
    addMoreQuery() {
      let queryName = "query" + (this.moreQuerys.length + 1);
      this.moreQuerys.push({
        name: queryName,
        sql: '',
        result: [],
        resultColumns: [],
        queryed: false
      });
      this.selectedTab = queryName;
      console.log("moreQuerys", this.moreQuerys);
    },
    async queryTable(table, whereCondition) {
      return await this.selectTable(table, whereCondition);
    },
    async selectTable(table, whereCondition = "") {
      console.log(table, "selectTable");
      let querySql = 'select * from ' + table;
      if (whereCondition) {
        querySql += ' where ' + whereCondition;
      } else {
        this.tableWhereCondition = '';
      }
      const result = await window.api.queryDatabase(querySql + ';', []);
      console.log("result", result);
      this.tableData = result;
      const tableColumns = await window.api.queryDatabase('show columns from ' + table + ';', []);
      console.log("tableColumns", tableColumns);
      for (let i = 0; i < tableColumns.length; i++) {
        tableColumns[i]['title'] = tableColumns[i]['Field'];
        tableColumns[i]['key'] = tableColumns[i]['Field'];
        tableColumns[i]['dataKey'] = tableColumns[i]['Field'];
        tableColumns[i]['width'] = 100;
        tableColumns[i]['sortable'] = true;
      }
      console.log("tableColumns", tableColumns);
      this.tableColumns = tableColumns;
      this.selectedTable = table;
      this.selectedTab = table;
    },
    async selectDatabase(database) {
      console.log(database, "selectDatabase");
      store.selectDatabase(database);
      store.connectionConfig.database = database;
      await window.api.selectDatabase(database);
      const result = await window.api.queryDatabase('show tables;', []);
      let tables = [];
      console.log("result", result);
      for (let i = 0; i < result.length; i++) {
        tables.push({
          name: result[i]['Tables_in_' + database]
        });
      }
      console.log("xxx", tables);
      this.tables = tables;
    },
    async deleteDatabase() {
      this.$confirm('是否删除数据库？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        let result = await window.api.deleteDatabase(this.selectedDatabase);
        console.log(result)

        if (result.error) {
          this.$message.error(result.message);
          return;
        }
        this.$message.success('删除数据库成功');
        store.removeDatabase(this.selectedDatabase);
        this.selectedDatabase = ""
      }).catch(() => {
        
      });
    }
  }
}
</script>