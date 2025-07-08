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
      <el-form-item>
        <el-button type="primary" @click="handleLogin">连接</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const host = ref('10.16.6.152');
const port = ref('3306');
const username = ref('kfc');
const password = ref('kfc');
import store from './store';

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
    database: ''
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