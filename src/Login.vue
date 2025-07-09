<template>
  <div>
    <h2>主机登录</h2>
    <el-form @submit.prevent="handleLogin" label-width="60px" ref="formRef" :model="form">
      <el-form-item label="主机" :rules="[{ required: true, message: '请输入主机' }]" prop="host">
        <el-input v-model="form.host" />
      </el-form-item>
      <el-form-item label="端口" :rules="[{ required: true, message: '请输入端口' }]" prop="port">
        <el-input v-model="form.port" />
      </el-form-item>
      <el-form-item label="用户" :rules="[{ required: true, message: '请输入用户' }]" prop="username">
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="form.password" />
      </el-form-item>
      <el-form-item label="名称" placeholder="输入链接名会自动保存">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin(formRef)">连接</el-button>
        <el-button type="danger" @click="clearLastConnectionConfig">清除</el-button>
      </el-form-item>
    </el-form>
    <div style="padding: 10px;">
      <div style="color: #999; font-size: 14px;">添加下面tag可以快速连接</div>
      <el-tag style="cursor: pointer; margin-top: 10px; margin-left: 10px;" v-for="item, name in connectionConfigs"
        :key="item" closable @close="handleCloseConnection(name)" @click="handleSelectConnection(item)">{{ name
        }}</el-tag>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

const formRef = ref();
const form = reactive({
  host: localStorage.getItem("lastConnectionConfig") ? JSON.parse(localStorage.getItem("lastConnectionConfig")).host : '',
  port: localStorage.getItem("lastConnectionConfig") ? JSON.parse(localStorage.getItem("lastConnectionConfig")).port : '',
  username: localStorage.getItem("lastConnectionConfig") ? JSON.parse(localStorage.getItem("lastConnectionConfig")).username : '',
  password: localStorage.getItem("lastConnectionConfig") ? JSON.parse(localStorage.getItem("lastConnectionConfig")).password : '',
  name: localStorage.getItem("lastConnectionConfig") ? JSON.parse(localStorage.getItem("lastConnectionConfig")).name : '',
});
import store from './store';
const connectionConfigs = ref(localStorage.getItem("savedConnectionConfigs") ? JSON.parse(localStorage.getItem("savedConnectionConfigs")) : {});

function handleSelectConnection(item) {
  form.host = item.host;
  form.port = item.port;
  form.username = item.username;
  form.password = item.password;
  form.name = item.name;
}
async function handleLogin(formRef) {
  await formRef.validate((valid) => {
    if (valid) {
      console.log('submit');
      doHandleLogin();
    } else {
      console.log('error submit!!');
      return false;
    }
  });
}
async function doHandleLogin() {
  // 这里只做简单打印，后续可扩展为实际登录逻辑
  console.log('Host:', form.host);
  console.log('Port:', form.port);
  console.log('Username:', form.username);
  console.log('Password:', form.password);
  let config = {
    host: form.host,
    port: form.port,
    username: form.username,
    password: form.password,
    database: '',
    name: form.name,
  }
  let result = await window.api.connectDatabase(config.host, config.port, config.username, config.password, config.database);
  console.log("result", result);
  if (result.error) {
    ElMessage.error(result.message);
    return;
  }
  store.saveConnectionConfig(config);

  const dbResult = await window.api.queryDatabase('show databases', []);
  console.log("dbResult", dbResult);
  if (dbResult.error) {
    ElMessage.error(dbResult.message);
    return;
  }
  localStorage.setItem("lastConnectionConfig", JSON.stringify(config));
  if (config.name) {
    let saveFileData = localStorage.getItem("savedConnectionConfigs") ? JSON.parse(localStorage.getItem("savedConnectionConfigs")) : {};
    saveFileData[config.name] = config;
    localStorage.setItem("savedConnectionConfigs", JSON.stringify(saveFileData));
  }
  console.log(dbResult);
  for (let i = 0; i < dbResult.length; i++) {
    if (!store.databases.includes(dbResult[i].Database)) { store.addDatabase(dbResult[i].Database); }
  }
  store.login();
}
function clearLastConnectionConfig() {
  localStorage.removeItem("lastConnectionConfig");
  form.host = '';
  form.port = '';
  form.username = '';
  form.password = '';
  form.name = '';
}
function handleCloseConnection(name) {
  let saveFileData = localStorage.getItem("savedConnectionConfigs") ? JSON.parse(localStorage.getItem("savedConnectionConfigs")) : {};
  delete saveFileData[name];
  localStorage.setItem("savedConnectionConfigs", JSON.stringify(saveFileData));
  connectionConfigs.value = saveFileData;
}
</script>