<template>
    <d2-container>
        <!-- 顶部插槽 -->
        <div slot="header">  过滤信息 </div>
          <!-- 底插槽 -->
        <div slot="footer">
            <el-pagination
                background
                layout="prev, pager, next"
                :page-size="limit"
                :total="total"
                @current-change="handlePageChange"
             />

        </div>

        <!--表格-->
        <el-table :data="tabelData">
             <el-table-column   prop="buildId" label="id" width="180" />
             <el-table-column   prop="name" label="名称"  />
             <el-table-column   prop="address" label="地址"  />
        </el-table>

    </d2-container>
</template>
<script>
export default {
  data () {
    return {
      tabelData: [],
      page: 1,
      limit: 2,
      total: 0
    }
  },
  watch: {
    page () {
      this.getList()
    }
  },
  created () {
    this.getList()
  },
  methods: {
    handlePageChange (res) {
      this.page = res
    },
    async getList () {
      const res = await this.$api.post('/build/queryBuild', { limit: this.limit, page: this.page })
      const { success, data } = res.data
      if (success) {
        this.tabelData = data.rows
        this.total = data.count
      }
    }
  }
}
</script>
