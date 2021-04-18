<template>
  <el-container class="home_container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout" class="btn_logout">退出</el-button>
    </el-header>
    <!-- 页面主题区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 侧边栏菜单区域 -->
        <div class="toggle_button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#313743"
          text-color="#fff"
          active-text-color="#379AFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menusList"
            :key="item.id"
          >
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <!-- 一级菜单模板区域 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: '',
  components: {},
  props: {},
  data () {
    return {
      // 左侧菜单数据
      menusList: [],
      iconObj: {
        125: 'el-icon-user-solid',
        103: 'el-icon-s-tools',
        101: 'el-icon-s-goods',
        102: 'el-icon-s-order',
        145: 'el-icon-s-marketing'
      },
      // 是否折叠侧边栏
      isCollapse: false,
      // 被激活的链接地址
      activePath: ''
    }
  },
  computed: {},
  watch: {},
  created () {
    this.getMenusList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  mounted () {},
  methods: {
    // 退出登录
    logout () {
      this.$confirm('是否退出账号', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          window.sessionStorage.clear()
          this.$router.push('/login')
          this.$message.success('退出成功!')
        })
        .catch(() => {
          this.$message.info('暂不退出')
        })
    },

    // 左侧菜单数据
    async getMenusList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menusList = res.data
      console.log(res.data)
    },

    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },

    // 保存链接的激活状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style scoped lang="less">
.home_container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  align-items: center;
  justify-content: space-between;
  span {
    color: #ffffff;
    font-size: 20px;
    // font-family: serif;
  }
  img {
    width: 100%;
    height: 100%;
  }
}

.el-aside {
  background-color: #313743;
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #e9edf1;
}
.toggle_button {
  background-color: #495065;
  color: #ffffff;
  line-height: 24px;
  font-size: 10px;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
