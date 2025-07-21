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
                <el-tooltip content="新建数据库" placement="right">
                  <img :src="newDbImage" style="width: 20px; height: 20px;" />
                </el-tooltip>
              </el-button>
              <el-button type="text" v-if="canDeleteDatabase" @click="deleteDatabase"
                style="margin-left: 0px; color: red">
                <el-tooltip content="删除数据库" placement="right">
                  <img :src="deleteDbImage" style="width: 20px; height: 20px;" />
                </el-tooltip>
              </el-button>
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
            <div style="font-size: 14px; margin-top: 5px; margin-left: 3px; color: #999;">表与视图：</div>
            <div v-if="selectedDatabase" style="background-color: #eee; padding: 3px;">
              <div v-for="table in showTables" :key="table.name" :index="table.name">
                <div style="height: 30px; line-height: 30px; cursor: pointer; color: gray;"
                  v-if="table.name != selectedTable" @click="selectTable(table.name)">{{ table.name }}</div>
                <el-dropdown v-else style="height: 30px; line-height: 30px; width: 100%;">
                  <span class="el-dropdown-link" style="color:rgb(64, 158, 255); font-size: 16px; height: 30px;">
                    {{ table.name }}
                    <el-icon class="el-icon--right">
                      <arrow-down />
                    </el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="beginDeleteTable(table.name)" style="color: red;" :disabled="!canDeleteTable">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
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
                <el-input v-model="tableWhereCondition" placeholder="查询条件" style="width: calc(100% - 100px);"></el-input>
                <el-select v-model="tableQueryLimit" placeholder="查询条数" style="width: 100px;">
                  <el-option label="1" value="1" />
                  <el-option label="5" value="5" />
                  <el-option label="20" value="20" />
                  <el-option label="50" value="50" />
                  <el-option label="100" value="100" />
                  <el-option label="all" value="all" />
                </el-select>
              </div>
              <el-row>
                <el-col :span="20">
                  <div style="margin-top: 20px; font-size: 14px; color: #999;">查询到{{ tableData.length }}结果,如下：</div>
                </el-col>
                <el-col :span="4">
                  <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
                    <el-button type="text" @click="beginInsertTable">新增记录</el-button>
                    <el-button type="primary" @click="queryTable(selectedTable, tableWhereCondition, tableQueryLimit)">查询</el-button>
                  </div>
                </el-col>
              </el-row>
              <div style="height: 80vh;">
                <el-auto-resizer>
                  <template #default="{ height, width }">
                    <el-table-v2 :data="tableData" :width="width" :height="height" :columns="tableColumns" fixed @column-sort="onTableSort" :sort-by="tableDataSortBy"></el-table-v2>
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
              <div style="height: 80vh;">
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
    <el-dialog v-model="showCreateTableModal" title="新建表" width="70%">
      <el-input v-model="newTableName" placeholder="请输入表名称" />
      <el-input v-model="newTableComment" placeholder="请输入表注释" style="margin-top: 10px;" />
      <el-table :data="newTableColumns" style="width: 100%">
        <el-table-column prop="name" label="字段名称">
          <template #default="scope">
            <el-input v-model="scope.row.name" />
          </template>
        </el-table-column>
        <el-table-column prop="type" label="字段类型">
          <template #default="scope">
            <el-select v-model="scope.row.type" placeholder="请选择字段类型">
              <el-option label="int" value="int" />
              <el-option label="varchar" value="varchar" />
              <el-option label="text" value="text" />
              <el-option label="datetime" value="datetime" />
              <el-option label="date" value="date" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="length" label="字段长度">
          <template #default="scope">
            <el-input v-model="scope.row.length" />
          </template>
        </el-table-column>
        <el-table-column prop="is_primary" label="是否为主键">
          <template #default="scope">
            <el-checkbox v-model="scope.row.is_primary" />
          </template>
        </el-table-column>
        <el-table-column prop="is_auto_increment" label="是否自增">
          <template #default="scope">
            <el-checkbox v-model="scope.row.is_auto_increment" />
          </template>
        </el-table-column>
        <el-table-column prop="is_unique" label="是否为唯一">
          <template #default="scope">
            <el-checkbox v-model="scope.row.is_unique" />
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="字段注释">
          <template #default="scope">
            <el-input v-model="scope.row.comment" />
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="text" @click="deleteTableColumn(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="text-align: right;">
        <el-button type="text" @click="addCreateTableColumn">添加字段</el-button>
      </div>
      <template #footer>
        <el-button @click="showCreateTableModal = false">取消</el-button>
        <el-button type="primary" @click="createTable">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="showInsertTableModal" title="新增记录" width="50%">
      <el-form :model="insertTableData" label-width="120px">
        <template v-for="column in tableColumns" :key="column.Field">
          <el-form-item v-if="column.Key != 'operations'" :label="column.Field">
            <span v-if="column.Extra == 'auto_increment'">自增主键</span>
            <el-input v-else v-model="insertTableData[column.Field]" />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="showInsertTableModal = false">取消</el-button>
        <el-button type="primary" @click="insertTable">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="showUpdateTableDataModal" title="修改记录" width="50%">
      <el-form :model="updateTableData" label-width="120px">
        <template v-for="column in tableColumns" :key="column.Field">
          <el-form-item v-if="column.Key != 'operations'" :label="column.Field">
            <span v-if="column.Extra == 'auto_increment'">{{updateTableData[column.Field]}}</span>
            <el-input v-else v-model="updateTableData[column.Field]" />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="showUpdateTableDataModal = false">取消</el-button>
        <el-button type="primary" @click="updateTable">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="jsx">
import { ref, computed, watch } from 'vue';
import { ElButton, ElMessage, ElMessageBox } from 'element-plus';
import store from './store';
import newDbImage from './Main/assets/images/new_db.png';
import newTableImage from './Main/assets/images/new_table.png';
import deleteDbImage from './Main/assets/images/drop_db.png';

import { ArrowDown } from '@element-plus/icons-vue'

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
const newTableComment = ref('');
const newTableColumns = ref([]);
const showInsertTableModal = ref(false);
const insertTableData = ref({});
const showUpdateTableDataModal = ref(false);
const updateTableData = ref({});
const tableQueryLimit = ref('all');
const tableDataSortBy = ref({});

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

const canDeleteTable = computed(() => {
  return canDeleteDatabase.value;
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
  newTableName.value = '';
  newTableColumns.value = [{
    name: 'id',
    type: 'int',
    length: '11',
    nullable: 'NO',
    default: 'NULL',
    is_primary: true,
    is_unique: false,
    is_auto_increment: true,
    comment: ''
  }];
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

const createTable = async () => {
  console.log("createTable", newTableName.value);
  if (!newTableName.value) {
    ElMessage.error('请输入表名称');
    return;
  }
  console.log("newTableColumns", newTableColumns.value, newTableName.value);
  let createTableSql = 'create table ' + newTableName.value + ' (';

  for (let i = 0; i < newTableColumns.value.length; i++) {
    if (i > 0) {
      createTableSql += ',';
    }
    createTableSql += newTableColumns.value[i].name + ' ' + newTableColumns.value[i].type + '(' + newTableColumns.value[i].length + ')';
    if (newTableColumns.value[i].is_primary) {
      createTableSql += ' primary key';
    }
    if (newTableColumns.value[i].is_unique) {
      createTableSql += ' unique';
    }
    if (newTableColumns.value[i].comment) {
      createTableSql += ' comment \'' + newTableColumns.value[i].comment + '\'';
    }
    if (newTableColumns.value[i].is_auto_increment) {
      createTableSql += ' auto_increment';
    }
  }
  createTableSql += ') ';
  if (newTableComment.value) {
    createTableSql += ' comment \'' + newTableComment.value + '\'';
  }
  console.log("createTableSql", createTableSql);
  let result = await window.api.queryDatabase(createTableSql, []);
  if (result.error) {
    ElMessage.error(result.message);
    return;
  }
  ElMessage.success('创建表成功');
  showCreateTableModal.value = false;
  selectDatabase(selectedDatabase.value);
};

const beginInsertTable = () => {
  console.log("beginInsertTable", tableColumns.value);
  showInsertTableModal.value = true;
}

const insertTable = async () => {
  console.log("insertTable", insertTableData.value, tableColumns.value);
  let insertTableSql = 'insert into ' + selectedTable.value + " ( ";
  for (let i = 0; i < tableColumns.value.length; i++) {
    if (typeof (insertTableData.value[tableColumns.value[i].Field]) != 'undefined') {
      insertTableSql += tableColumns.value[i].Field + ',';
    }
  }
  insertTableSql = insertTableSql.slice(0, -1);
  insertTableSql += ' ) ';
  insertTableSql += ' values (';
  for (let i = 0; i < tableColumns.value.length; i++) {
    if (typeof (insertTableData.value[tableColumns.value[i].Field]) != 'undefined') {
      insertTableSql += "'" + insertTableData.value[tableColumns.value[i].Field] + "',";
    }
  }
  insertTableSql = insertTableSql.slice(0, -1);
  insertTableSql += ')';
  console.log("insertTableSql", insertTableSql);
  let result = await window.api.queryDatabase(insertTableSql, []);
  if (result.error) {
    ElMessage.error(result.message);
    return;
  }
  ElMessage.success('新增记录成功');
  showInsertTableModal.value = false;
  selectTable(selectedTable.value);
  insertTableData.value = {};
}

const beginDeleteTable = (tableName) => {
  ElMessageBox.confirm('是否删除表' + tableName + '？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteTable(tableName);
  });
}

const deleteTable = async (tableName) => {
  let result = await window.api.queryDatabase('drop table ' + tableName + ';', []);
  if (result.error) {
    ElMessage.error(result.message);
    return;
  }
  ElMessage.success('删除表成功');
  selectedTable.value = '';
  selectDatabase(selectedDatabase.value);
}

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

const addCreateTableColumn = () => {
  newTableColumns.value.push({
    name: '',
    type: '',
    length: '',
    nullable: 'NO',
    default: 'NULL',
    is_primary: false,
    is_unique: false,
    is_auto_increment: false,
    comment: ''
  })
}

const deleteTableColumn = (column) => {
  newTableColumns.value = newTableColumns.value.filter(c => c.name !== column.name);
}

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

const queryTable = async (table, whereCondition, limit) => {
  return await selectTable(table, whereCondition, limit);
};

const selectTable = async (table, whereCondition = "", limit = "all") => {
  console.log(table, "selectTable");
  let querySql = 'select * from ' + table;
  if (whereCondition) {
    querySql += ' where ' + whereCondition;
  } else {
    tableWhereCondition.value = '';
  }
  if (limit != "all") {
    querySql += ' limit ' + limit;
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
  tableColumnsResult.push({
    Key: 'operations',
    title: 'operations',
    cellRenderer: (params) => (
      <>
        <ElButton size="small" type="primary" onClick={() => beginUpdateTableData(params)}>修改</ElButton>
        <ElButton size="small" type="danger" onClick={() => beginDeleteTableData(params)}>删除</ElButton>
      </>
    ),
    width: 150,
    align: 'center',
    flexGrow: 1,
  },)
  tableColumns.value = tableColumnsResult;
  selectedTable.value = table;
  selectedTab.value = table;
};

const beginDeleteTableData = (params) => {
  console.log("beginDeleteTableData", params);
  ElMessageBox.confirm('是否删除该记录？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteTableData(params);
  });
}

const beginUpdateTableData = (params) => {
  console.log("beginUpdateTableData", params);
  showUpdateTableDataModal.value = true;
  updateTableData.value = JSON.parse(JSON.stringify(params.rowData));
}

const updateTable = async () => {
  console.log("updateTable", updateTableData.value);
  let updateTableSql = 'update ' + selectedTable.value + ' set ';
  let primaryKey = '';
  for (let i = 0; i < tableColumns.value.length; i++) {
    if (tableColumns.value[i].Key == 'PRI') {
      primaryKey = tableColumns.value[i].Field;
    }
  }
  if (!primaryKey) {
    ElMessage.error('表没有主键');
  }
  for (let i = 0; i < tableColumns.value.length; i++) {
    if (typeof (updateTableData.value[tableColumns.value[i].Field]) != 'undefined') {
      updateTableSql += tableColumns.value[i].Field + ' = "' + updateTableData.value[tableColumns.value[i].Field] + '",';
    }
  }
  updateTableSql = updateTableSql.slice(0, -1);
  updateTableSql += ' where ' + primaryKey + ' = ' + updateTableData.value[primaryKey] + ';';
  console.log("updateTableSql", updateTableSql);
  let result = await window.api.queryDatabase(updateTableSql, []);
  if (result.error) {
    ElMessage.error(result.message);
    return;
  }
  ElMessage.success('修改记录成功');
  showUpdateTableDataModal.value = false;
  selectTable(selectedTable.value);
}

const deleteTableData = async (params) => {
  console.log("deleteTableData", params);
  let columns = params.columns;
  let primaryKey = '';
  let primaryKeyValue = '';
  for (let i = 0; i < columns.length; i++) {
    if (columns[i].Key == 'PRI') {
      primaryKey = columns[i].dataKey;
      primaryKeyValue = params.rowData[primaryKey];
    }
  }
  console.log("primaryKey", primaryKey, primaryKeyValue);

  let deleteTableDataSql = 'delete from ' + selectedTable.value + ' where ' + primaryKey + ' = ' + primaryKeyValue + ';';
  console.log("deleteTableDataSql", deleteTableDataSql);
  let result = await window.api.queryDatabase(deleteTableDataSql, []);
  if (result.error) {
    ElMessage.error(result.message);
    return;
  }
  ElMessage.success('删除记录成功');
  selectTable(selectedTable.value);
}

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

const onTableSort = (column) => {
  console.log("onTableSort", column);
  tableQueryLimit.value = column.order == 'ascending' ? 'asc' : 'desc';
  console.log("tableQueryLimit", tableQueryLimit.value, selectedTable.value, tableWhereCondition.value);
  queryTable(selectedTable.value, tableWhereCondition.value, tableQueryLimit.value);
}
</script>