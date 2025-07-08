<template>
  <div>
    <el-row>
      <el-col :span="6">
        <el-select v-model="selectedDatabase" placeholder="请选择数据库">
          <el-option v-for="database in databases" :key="database" :label="database" :value="database" />
        </el-select>
        <el-menu v-if="selectedDatabase">
          <el-menu-item v-for="table in tables" :key="table.name" :index="table.name"
            @click="selectTable(table.name)">{{ table.name }}</el-menu-item>
        </el-menu>
      </el-col>
      <el-col :span="16">
        <el-tabs v-model="selectedTab">
          <el-tab-pane v-if="selectedTable" :label="selectedTable">
            <el-table :data="tableData" style="width: 100%">
              <el-table-column v-for="column in tableColumns" :key="column.Field" :label="column.Field"
                :prop="column.Field" />
            </el-table>
          </el-tab-pane>
          <el-tab-pane v-for="query in moreQuerys" :key="query.name" :label="query.name">
            <el-input v-model="query.sql" type="textarea" :rows="3" />
            <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
              <el-button type="primary" @click="querySql(query)">查询</el-button>
            </div>
            <el-table :data="query.result" style="width: 100%">
              <el-table-column v-for="column in query.resultColumns" :key="column" :label="column"
                :prop="column" />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-col>
      <el-col :span="2">
        <el-button type="primary" @click="addMoreQuery">添加</el-button>
      </el-col>
    </el-row>
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
      moreQuerys: []
    }
  },
  computed: {
    databases() {
      return store.databases;
    }
  },
  watch: {
    selectedDatabase: {
      handler(newVal) {
        this.selectDatabase(newVal);
      },
      immediate: true
    }
  },
  methods: {
    async querySql(query) {
      console.log("querySql", query);
      const result = await window.api.queryDatabase(query.sql, []);
      console.log("result", result);
      query.result = result;
      if (result.length > 0) {
        query.resultColumns = Object.keys(result[0]);
      }
    },
    addMoreQuery() {
      this.moreQuerys.push({
        name: "query" + (this.moreQuerys.length + 1),
        sql: '',
        result: []
      });
      console.log("moreQuerys", this.moreQuerys);
    },
    async selectTable(table) {
      console.log(table, "selectTable");
      const result = await window.api.queryDatabase('select * from ' + table + ';', []);
      console.log("result", result);
      this.tableData = result;
      const tableColumns = await window.api.queryDatabase('show columns from ' + table + ';', []);
      console.log("tableColumns", tableColumns);
      this.tableColumns = tableColumns;
      this.selectedTable = table;
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