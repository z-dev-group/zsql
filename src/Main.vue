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
          <div style="background-color: #eee; padding: 3px; margin-top: 1px; height: 80vh;">
            <div style="font-size: 14px; margin-top: 5px; margin-left: 7px; color: #999;">表与视图：</div>
            <el-menu v-if="selectedDatabase" style="margin-left: -12px; background-color: #eee;">
              <el-menu-item v-for="table in showTables" :key="table.name" :index="table.name" style="height: 35px;"
                @click="selectTable(table.name)">{{ table.name }}</el-menu-item>
            </el-menu>
            <div v-else style="height: 80vh; display: flex; justify-content: center; align-items: center;">
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
              <div>
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
              <div>
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

<script setup>
import { ref, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import store from './store';
import newDbImage from './Main/assets/images/new_db.jpeg';
import newTableImage from './Main/assets/images/new_table.png';

// 响应式数据
const tables = ref([]);
const selectedDatabase = ref('');
const tableColumns = ref([]);
const tableData = ref([]);
const selectedTable = ref('');
const moreQuerys = ref([]);
const selectedTab = ref('');
const filterTable = ref('');
const tableWhereCondition = ref('');
const showCreateDatabaseModal = ref(false);
const showCreateTableModal = ref(false);
const newDatabaseName = ref('');
const newTableName = ref('');

// 计算属性
const databases = computed(() => store.databases);

const showTables = computed(() => {
  if (!filterTable.value) return tables.value;
  return tables.value.filter(table => table.name.includes(filterTable.value));
});

const canDeleteDatabase = computed(() => {
  let systemDatabases = ['sys', 'mysql', 'information_schema', 'performance_schema'];
  return !systemDatabases.includes(selectedDatabase.value) && selectedDatabase.value;
});

// 监听器
watch(selectedDatabase, (newVal) => {
  if (!newVal) {
    selectedTable.value = '';
    return;
  }
  filterTable.value = '';
  selectDatabase(newVal);
}, { immediate: true });

// 方法
const beginCreateDatabase = () => {
  showCreateDatabaseModal.value = true;
  console.log("beginCreateDatabase");
};

const beginCreateTable = () => {
  console.log("beginCreateTable");
  showCreateTableModal.value = true;
};

const createDatabase = async () => {
  console.log("createDatabase", newDatabaseName.value);
  if (!newDatabaseName.value) {
    ElMessage.error('请输入数据库名称');
    return;
  }
  if (databases.value.includes(newDatabaseName.value)) {
    ElMessage.error('数据库已存在');
    return;
  }
  let result = await window.api.createDatabase(newDatabaseName.value);
  if (result.error) {
    ElMessage.error(result.message);
    return;
  }
  showCreateDatabaseModal.value = false;
  ElMessage.success('创建数据库成功');
  store.addDatabase(newDatabaseName.value);
  newDatabaseName.value = '';
};

const createTable = () => {
  console.log("createTable", newTableName.value);
  if (!newTableName.value) {
    ElMessage.error('请输入表名称');
    return;
  }
};

const handleEditTab = (targetName, action) => {
  console.log("handleEditTab", targetName, action);
  if (action === 'remove') {
    moreQuerys.value = moreQuerys.value.filter(query => query.name !== targetName);
    if (selectedTable.value === targetName) {
      selectedTable.value = '';
    }
  }
  if (action === 'add') {
    addMoreQuery();
  }
};

const querySql = async (query) => {
  console.log("querySql", query);
  const result = await window.api.queryDatabase(query.sql, []);
  console.log("result", result);
  if (result.error) {
    ElMessage.error(result.message);
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
      };
      queryResultColumns.push(column);
    }
    query.resultColumns = queryResultColumns;
  }
};

const addMoreQuery = () => {
  let queryName = "query" + (moreQuerys.value.length + 1);
  moreQuerys.value.push({
    name: queryName,
    sql: '',
    result: [],
    resultColumns: [],
    queryed: false
  });
  selectedTab.value = queryName;
  console.log("moreQuerys", moreQuerys.value);
};

const queryTable = async (table, whereCondition) => {
  return await selectTable(table, whereCondition);
};

const selectTable = async (table, whereCondition = "") => {
  console.log(table, "selectTable");
  let querySql = 'select * from ' + table;
  if (whereCondition) {
    querySql += ' where ' + whereCondition;
  } else {
    tableWhereCondition.value = '';
  }
  const result = await window.api.queryDatabase(querySql + ';', []);
  console.log("result", result);
  tableData.value = result;
  const tableColumnsResult = await window.api.queryDatabase('show columns from ' + table + ';', []);
  console.log("tableColumns", tableColumnsResult);
  for (let i = 0; i < tableColumnsResult.length; i++) {
    tableColumnsResult[i]['title'] = tableColumnsResult[i]['Field'];
    tableColumnsResult[i]['key'] = tableColumnsResult[i]['Field'];
    tableColumnsResult[i]['dataKey'] = tableColumnsResult[i]['Field'];
    tableColumnsResult[i]['width'] = 100;
    tableColumnsResult[i]['sortable'] = true;
  }
  console.log("tableColumns", tableColumnsResult);
  tableColumns.value = tableColumnsResult;
  selectedTable.value = table;
  selectedTab.value = table;
};

const selectDatabase = async (database) => {
  console.log(database, "selectDatabase");
  store.selectDatabase(database);
  store.connectionConfig.database = database;
  await window.api.selectDatabase(database);
  const result = await window.api.queryDatabase('show tables;', []);
  let tablesList = [];
  console.log("result", result);
  for (let i = 0; i < result.length; i++) {
    tablesList.push({
      name: result[i]['Tables_in_' + database]
    });
  }
  console.log("xxx", tablesList);
  tables.value = tablesList;
};

const deleteDatabase = async () => {
  try {
    await ElMessageBox.confirm('是否删除数据库' + selectedDatabase.value + '？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    let result = await window.api.deleteDatabase(selectedDatabase.value);
    console.log(result);

    if (result.error) {
      ElMessage.error(result.message);
      return;
    }
    ElMessage.success('删除数据库成功');
    store.removeDatabase(selectedDatabase.value);
    selectedDatabase.value = "";
  } catch (error) {
    // 用户取消操作
  }
};
</script>