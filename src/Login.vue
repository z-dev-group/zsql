<template>
  <div>
    <h1>登录</h1>
    <el-form @submit.prevent="handleLogin" label-width="100px">
      <el-form-item label="主机">
        <el-input v-model="host" required />
      </el-form-item>
      <el-form-item label="端口">
        <el-input v-model="port" required />
      </el-form-item>
      <el-form-item label="用户">
        <el-input v-model="username" required />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="password" required />
      </el-form-item>
      <el-form-item label="名称" placeholder="输入链接名会自动保存">
        <el-input v-model="connection_name" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin">连接</el-button>
      </el-form-item>
    </el-form>
    <div>添加下面tag可以快速连接</div>
    <el-tag style="cursor: pointer; margin-top: 10px;" v-for="item, name in connectionConfigs" :key="item" @click="handleSelectConnection(item)">{{ name }}</el-tag>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const host = ref('');
const port = ref('');
const username = ref('');
const password = ref('');
const connection_name = ref('');
import store from './store';
const connectionConfigs = ref(localStorage.getItem("savedConnectionConfigs") ? JSON.parse(localStorage.getItem("savedConnectionConfigs")) : {});

function handleSelectConnection(item) {
  host.value = item.host;
  port.value = item.port;
  username.value = item.username;
  password.value = item.password;
  connection_name.value = name;
}
async function handleLogin() {
  // 验证表单
  if (!host.value || !port.value || !username.value) {
    ElMessage.error('请填写完整信息')
    return;
  }
  // 这里只做简单打印，后续可扩展为实际登录逻辑
  console.log('Host:', host.value);
  console.log('Port:', port.value);
  console.log('Username:', username.value);
  console.log('Password:', password.value);
  let config = {
    host: host.value,
    port: port.value,
    username: username.value,
    password: password.value,
    database: '',
  }
  if (connection_name.value) {
    let saveFileData = localStorage.getItem("savedConnectionConfigs") ? JSON.parse(localStorage.getItem("savedConnectionConfigs")) : {};
    saveFileData[connection_name.value] = config;
    localStorage.setItem("savedConnectionConfigs", JSON.stringify(saveFileData));
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
  console.log(dbResult);
  for (let i = 0; i < dbResult.length; i++) {
    if (!store.databases.includes(dbResult[i].Database)) { store.addDatabase(dbResult[i].Database); }
  }
  store.login();
}
</script>