<template>
  <div style="padding: 10px;">
    <div style="display: flex;">
      <div style="width: 200px; border-left: 1px solid #e6e6e6; padding-left: 10px;">
        <div>
          <el-select v-model="selectedDatabase" placeholder="请选择数据库" filterable style="width: 100%;" clearable>
            <el-option v-for="database in databases" :key="database" :label="database" :value="database" />
          </el-select>
          <el-input v-model="filterTable" placeholder="请输入表名进行过滤" v-if="selectedDatabase"
            style="width: 100%; margin-top: 10px;" clearable size="small" />
        </div>
        <el-menu v-if="selectedDatabase" style="height: 30px;">
          <el-menu-item v-for="table in showTables" :key="table.name" :index="table.name" style="height: 35px;"
            @click="selectTable(table.name)">{{ table.name }}</el-menu-item>
        </el-menu>
        <div v-else style="height: 100vh; display: flex; justify-content: center; align-items: center;">
          <el-empty description="请选择数据库" />
        </div>
      </div>
      <div style="flex: 1; margin-left: 3px;">
        <el-tabs v-model="selectedTab" type="card" editable @edit="handleEditTab">
          <el-tab-pane v-if="selectedTable" :label="selectedTable" :name="selectedTable">
            <el-row>
              <el-col :span="20">
                <el-input v-model="tableWhereCondition" placeholder="查询条件"></el-input>
              </el-col>
              <el-col :span="4">
                <el-button type="primary" @click="queryTable(selectedTable, tableWhereCondition)">查询</el-button>
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
            <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
              <el-button type="primary" @click="querySql(query)">查询</el-button>
            </div>
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
    </div>
  </div>
</template>

<script>
import store from './store';
import { ref } from 'vue';
const databases = ref(store.databases);
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
      tableWhereCondition: ''
    }
  },
  computed: {
    databases() {
      return store.databases;
    },
    showTables() {
      if (!this.filterTable) return this.tables;
      return this.tables.filter(table => table.name.includes(this.filterTable));
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
        resultColumns: []
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
    }
  }
}
</script>