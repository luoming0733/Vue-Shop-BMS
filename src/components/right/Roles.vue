<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col :span="6">
          <el-button type="primary" @click="showAddRoles">添加角色</el-button>
        </el-col>
      </el-row>

      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bd_bottom', 'vcenter', i1 === 0 ? 'bd_top' : '']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag>
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="['vcenter', 'bd_top', i2 === 0 ? 'bd_no' : '']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 通过 for 循环嵌套渲染耳机权限 -->
                  <el-col :span="6">
                    <el-tag type="success">
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 循环渲染三级权限 -->
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作" width="290px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditRolesDialog(scope.row.id - 0)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRolesById(scope.row.id - 0)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRolesdialogVisible"
      width="50%"
    >
      <!-- 内容主题区域 -->
      <el-form
        :model="addRolesRuleForm"
        :rules="addRolesRules"
        ref="addRolesRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesRuleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesRuleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesClose">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRolesdialogVisible"
      width="50%"
    >
      <!-- 内容主题区域 -->
      <el-form
        :model="editRolesRuleForm"
        :rules="addRolesRules"
        ref="editRolesRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesRuleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesRuleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editRolesdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles(editRolesRuleForm.roleId)"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClose"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: '',
  components: {},
  props: {},
  data () {
    return {
      rolesList: [],
      // 控制添加角色对话框的显示和隐藏
      addRolesdialogVisible: false,
      // 添加角色的表单
      addRolesRuleForm: {},
      // 添加角色表单的验证规则对象
      addRolesRules: {
        roleName: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ]
      },
      // 控制编辑角色对话框的显示和隐藏
      editRolesdialogVisible: false,
      // 编辑角色的表单
      editRolesRuleForm: {},
      // 控制分配权限对话框的显示和隐藏
      setRightDialogVisible: false,
      // 权限列表
      rightList: [],
      // 树形控件的树形绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点Id值
      defKeys: [],
      // 即将分配权限的角色id
      roleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表的数据
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      this.rolesList = res.data
    },

    // 展示添加角色对话框
    showAddRoles () {
      this.addRolesdialogVisible = true
    },

    // 关闭添加角色对话框
    addRolesClose () {
      this.addRolesdialogVisible = false
      this.$refs.addRolesRef.resetFields()
    },

    // 点击确定添加角色
    async addRoles () {
      const { data: res } = await this.$http.post(
        'roles',
        this.addRolesRuleForm
      )
      console.log(res)
      if (res.meta.status !== 201) {
        return this.$message.error('添加用户失败,请重试!')
      }
      this.addRolesdialogVisible = false
      this.getRolesList()
      this.$message.success('添加用户成功!')
    },

    // 根据 ID 删除角色
    removeRolesById (id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`roles/${id}`)
          if (res.meta.status !== 200) {
            return this.$message.error('删除失败,请重试!')
          }
          this.getRolesList()
          this.$message.success('删除角色成功!')
        })
        .catch(() => {
          this.$message.info('已取消删除')
        })
    },

    // 展开修改角色对话框
    async showEditRolesDialog (id) {
      this.editRolesdialogVisible = true
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取失败,请重试!')
      }
      this.editRolesRuleForm = res.data
    },

    // 根据ID点击确定修改角色
    async editRoles (roleId) {
      const { data: res } = await this.$http.put(
        `roles/${roleId}`,
        this.editRolesRuleForm
      )
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败,请重试!')
      }
      this.getRolesList()
      this.$message.success('更新用户成功!')
      this.editRolesdialogVisible = false
    },

    // 展示分配权限对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表数据失败,请重试!')
      }
      this.rightList = res.data
      // 递归获取三级节点ID
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },

    // 通过递归的形式获取角色三级节点的ID
    getLeafKeys (node, arr) {
      // 如果当前node节点不包含children属性,则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },

    // 监听分配权限对话框的关闭事件
    setRightDialogClose () {
      this.defKeys = []
    },

    // 分配权限按钮的点击事件
    async setRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('更新权限失败,请重试!')
      }
      this.getRolesList()
      this.$message.success('更新权限成功')
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style scoped lang="less">
.el-tag {
  margin: 7px;
}
.bd_top {
  border-top: 1px solid #eee;
}
.bd_no {
  border-top: none;
}
.bd_bottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
