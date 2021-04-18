<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7"
          ><el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="searchUserClick"
            ></el-button> </el-input
        ></el-col>
        <el-col :span="4">
          <el-button type="primary" size="medium" @click="showAddUserDialog"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editUserInfo(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById"
            ></el-button>
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top-end"
              :enterable="false"
            >
              <!-- 分配角色按钮 -->
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button
            ></el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addUserDialogVisible"
      width="50%"
      @close="addUserDialogClosed"
    >
      <!-- 内容主题区域 -->
      <el-form
        ref="addUserFormRef"
        :model="addUserForm"
        :rules="addUserFormRules"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialogVisible = false">
          取 消
        </el-button>
        <el-button type="primary" @click="addUser">
          确 定
        </el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editUserDialogVisible"
      width="50%"
      @close="editUserDialogClosed"
    >
      <!-- 内容主题区域 -->
      <el-form
        ref="editUserFormRef"
        :model="editUserForm"
        :rules="addUserFormRules"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editUserDialogVisible = false">
          取 消
        </el-button>
        <el-button type="primary" @click="editUser">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { debounce } from '@/utils/debounce' // 引入防抖函数
import { checkPhone } from '@/utils/checkPhone' // 引入手机号码验证规则

export default {
  name: 'User',
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userlist: [],
      total: 0,
      // 控制添加用户对话框的显示和隐藏
      addUserDialogVisible: false,
      // 添加用户的表单数据
      addUserForm: {},
      // 添加用户的表单验证规则对象
      addUserFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        mobile: [{ required: true, validator: checkPhone, trigger: 'blur' }]
      },
      // 控制修改用户对话框的显示和隐藏
      editUserDialogVisible: false,
      // 查询到的用户信息对象
      editUserForm: {}
    }
  },

  created () {
    this.getUserList()
  },

  methods: {
    // 获取用户列表数据
    async getUserList () {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userlist = res.data.users
      this.total = res.data.total

      console.log(res)
    },

    // 监听 pagesize 改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },

    // 监听页码值改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },

    // 改变用户状态
    userStateChange: debounce(
      async function (userInfo) {
        const { data: res } = await this.$http.put(
          `users/${userInfo.id}/state/${userInfo.mg_state}`
        )
        if (res.meta.status !== 200) {
          userInfo.mg_state = !userInfo.mg_state
          return this.$message.error('更新用户状态失败，请重试！')
        }
        this.$message.success('用户状态设置成功！')
      },
      1000,
      true
    ),

    // 点击搜索用户按钮
    searchUserClick: debounce(
      function () {
        this.getUserList()
      },
      1000,
      true
    ),

    // 添加用户的对话框展开事件
    showAddUserDialog () {
      this.addUserDialogVisible = true
    },

    // 监听添加用户的对话框关闭事件
    addUserDialogClosed () {
      this.$refs.addUserFormRef.resetFields()
    },

    // 点击按钮添加新用户
    addUser () {
      this.$refs.addUserFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addUserForm)
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加新用户失败,请重试!')
        }
        this.getUserList()
        this.addUserDialogVisible = false
        this.$message.success('添加用户成功')
      })
    },

    // 展示修改用户信息对话框
    async editUserInfo (userId) {
      this.editUserDialogVisible = true
      const { data: res } = await this.$http.get(`users/${userId}`)
      if (res.meta.status !== 200) return
      this.editUserForm = res.data
      console.log(res)
      console.log(userId)
    },

    // 点击按钮修改用户
    editUser () {
      this.$refs.editUserFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `users/${this.editUserForm.id}`,
          this.editUserForm
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户失败，请重试！')
        }
        this.getUserList()
        this.editUserDialogVisible = false
        this.$message.success('更新用户成功！')
      })
    },

    // 修改用户对话框的关闭事件
    editUserDialogClosed () {
      this.$refs.editUserFormRef.resetFields()
    },

    // 根据ID删除用户
    removeUserById (userId) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`users/${userId}`)
          if (res.meta.status !== 200) {
            return this.$message.error('删除用户失败，请重试！')
          }
          this.$message.success('删除用户成功！')
          this.getUserList()
        })
        .catch(() => {
          this.$message.info('已取消删除')
        })
    }
  }
}
</script>

<style scoped lang="less"></style>
